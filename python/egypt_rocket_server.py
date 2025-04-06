#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
صاروخ مصر - خادم بايثون
=======================
هذا الملف يمثل الخادم الذي يدير لعبة صاروخ مصر باستخدام لغة بايثون
"""

import os
import time
import json
import random
import threading
import numpy as np
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv

# تحميل متغيرات البيئة
load_dotenv()

app = Flask(__name__, static_folder="../public", static_url_path="/public")
app.config['SECRET_KEY'] = 'سر_صاروخ_مصر'
socketio = SocketIO(app, cors_allowed_origins="*")

# إعدادات اللعبة
ROUND_TIME = 30  # مدة الجولة بالثواني
MIN_CRASH_VALUE = 1.01  # أقل قيمة ممكنة للانفجار
ROUND_RESET_TIME = 5  # وقت الانتظار بين الجولات بالثواني

# حالة اللعبة
game_state = {
    'is_active': False,         # هل اللعبة نشطة حالياً
    'current_round': 0,         # رقم الجولة الحالية
    'round_start_time': 0,      # وقت بدء الجولة
    'crash_value': 0,           # قيمة الانفجار
    'current_multiplier': 1.0,  # المضاعف الحالي
    'players': {},              # اللاعبين في الجولة الحالية
    'last_results': [],         # نتائج آخر 10 جولات
    'round_history': []         # تاريخ كل الجولات
}

# جدول التسجيل
leaderboard = {}

# قفل للمزامنة
game_lock = threading.Lock()

def calculate_crash_value():
    """حساب قيمة الانفجار باستخدام توزيع مشابه للألعاب الحقيقية"""
    # استخدام توزيع احتمالي مخصص
    e = 100 / random.randint(3, 100)
    result = (e / (1 - random.random())) ** 0.9
    
    # جعل بعض النتائج تكون بالقرب من 1.0 (خسارة سريعة)
    if random.random() < 0.07:  # 7% فرصة
        result = random.uniform(1.01, 1.2)
    
    # تقريب النتيجة إلى رقمين بعد الفاصلة
    return max(MIN_CRASH_VALUE, round(result * 100) / 100)

def game_loop():
    """حلقة اللعبة الرئيسية"""
    global game_state
    
    while True:
        with game_lock:
            if not game_state['is_active']:
                # بداية جولة جديدة
                game_state['is_active'] = True
                game_state['current_round'] += 1
                game_state['round_start_time'] = time.time()
                game_state['crash_value'] = calculate_crash_value()
                game_state['current_multiplier'] = 1.0
                game_state['players'] = {}
                
                # إرسال إشعار بدء الجولة
                socketio.emit('round_start', {
                    'round_id': game_state['current_round'],
                    'start_time': game_state['round_start_time']
                })
                
                print(f"بدء الجولة {game_state['current_round']} - قيمة الانفجار: {game_state['crash_value']}")
        
        # حلقة تحديث المضاعف
        start_time = time.time()
        round_crashed = False
        
        while game_state['is_active'] and not round_crashed:
            elapsed = time.time() - start_time
            
            # حساب المضاعف الحالي - نموذج النمو الأسي
            with game_lock:
                # حساب المضاعف المتزايد تدريجياً
                multiplier = 1.0 + (0.07 * elapsed)
                game_state['current_multiplier'] = round(multiplier * 100) / 100
                
                # إذا وصل المضاعف إلى قيمة الانفجار
                if game_state['current_multiplier'] >= game_state['crash_value']:
                    round_crashed = True
                    handle_round_end()
                    break
                
                # إرسال تحديث المضاعف للاعبين
                if elapsed % 0.1 < 0.05:  # إرسال تحديثات بمعدل أقل
                    socketio.emit('multiplier_update', {
                        'multiplier': game_state['current_multiplier'],
                        'elapsed': elapsed
                    })
            
            # تأخير قصير لتقليل حمل المعالج
            time.sleep(0.05)
        
        # انتظار قبل الجولة التالية
        time.sleep(ROUND_RESET_TIME)

def handle_round_end():
    """معالجة نهاية الجولة"""
    global game_state
    
    with game_lock:
        # تحديث حالة انتهاء الجولة
        game_state['is_active'] = False
        
        # معالجة نتائج اللاعبين
        results = []
        for player_id, player_data in game_state['players'].items():
            if not player_data.get('cashed_out', False):
                # اللاعب لم يسحب قبل الانفجار - خسارة
                player_data['result'] = 'loss'
                player_data['profit'] = -player_data['bet_amount']
            
            # إضافة النتيجة إلى القائمة
            results.append({
                'player_id': player_id,
                'username': player_data.get('username', f'لاعب_{player_id}'),
                'bet_amount': player_data['bet_amount'],
                'multiplier': player_data.get('cash_out_multiplier', 0),
                'profit': player_data.get('profit', 0),
                'result': player_data.get('result', 'loss')
            })
            
            # تحديث جدول التسجيل
            if player_id in leaderboard:
                leaderboard[player_id]['total_profit'] += player_data.get('profit', 0)
                leaderboard[player_id]['games_played'] += 1
            else:
                leaderboard[player_id] = {
                    'username': player_data.get('username', f'لاعب_{player_id}'),
                    'total_profit': player_data.get('profit', 0),
                    'games_played': 1
                }
        
        # حفظ نتائج الجولة
        round_result = {
            'round_id': game_state['current_round'],
            'crash_value': game_state['crash_value'],
            'results': results,
            'timestamp': time.time()
        }
        
        game_state['round_history'].append(round_result)
        
        # حفظ آخر 10 نتائج
        if len(game_state['last_results']) >= 10:
            game_state['last_results'].pop(0)
        game_state['last_results'].append(game_state['crash_value'])
        
        # إرسال نتائج الجولة
        socketio.emit('round_end', round_result)
        print(f"انتهاء الجولة {game_state['current_round']} - قيمة الانفجار: {game_state['crash_value']}")

@socketio.on('connect')
def handle_connect():
    """معالجة اتصال اللاعب"""
    print(f"اتصال جديد: {request.sid}")
    
    # إرسال حالة اللعبة الحالية
    emit('game_state', {
        'is_active': game_state['is_active'],
        'current_round': game_state['current_round'],
        'current_multiplier': game_state['current_multiplier'],
        'round_start_time': game_state['round_start_time'],
        'last_results': game_state['last_results']
    })

@socketio.on('disconnect')
def handle_disconnect():
    """معالجة قطع اتصال اللاعب"""
    print(f"انقطاع اتصال: {request.sid}")

@socketio.on('place_bet')
def handle_place_bet(data):
    """معالجة وضع رهان"""
    player_id = data.get('player_id')
    username = data.get('username', f'لاعب_{player_id}')
    bet_amount = data.get('bet_amount', 0)
    auto_cash_out = data.get('auto_cash_out', 0)
    
    if not player_id or bet_amount <= 0:
        emit('bet_response', {'success': False, 'message': 'معلومات الرهان غير صالحة'})
        return
    
    with game_lock:
        # التحقق من أن اللعبة في حالة نشطة وأن اللاعب لم يراهن بالفعل
        if not game_state['is_active']:
            emit('bet_response', {'success': False, 'message': 'الجولة غير نشطة حالياً'})
            return
        
        if player_id in game_state['players']:
            emit('bet_response', {'success': False, 'message': 'تم وضع رهان بالفعل في هذه الجولة'})
            return
        
        # إضافة رهان
        game_state['players'][player_id] = {
            'username': username,
            'bet_amount': bet_amount,
            'auto_cash_out': auto_cash_out,
            'cashed_out': False
        }
        
        emit('bet_response', {
            'success': True, 
            'message': 'تم وضع الرهان بنجاح',
            'bet_data': {
                'player_id': player_id,
                'bet_amount': bet_amount,
                'auto_cash_out': auto_cash_out
            }
        })
        
        # إرسال تحديث للاعبين الآخرين
        socketio.emit('new_bet', {
            'player_id': player_id,
            'username': username,
            'bet_amount': bet_amount
        }, skip_sid=request.sid)

@socketio.on('cash_out')
def handle_cash_out(data):
    """معالجة سحب الأموال"""
    player_id = data.get('player_id')
    
    if not player_id:
        emit('cash_out_response', {'success': False, 'message': 'معلومات اللاعب غير صالحة'})
        return
    
    with game_lock:
        # التحقق من أن اللاعب قد وضع رهان ولم يسحب بعد
        if not game_state['is_active']:
            emit('cash_out_response', {'success': False, 'message': 'الجولة غير نشطة حالياً'})
            return
        
        if player_id not in game_state['players']:
            emit('cash_out_response', {'success': False, 'message': 'لم تضع رهان في هذه الجولة'})
            return
        
        player_data = game_state['players'][player_id]
        if player_data.get('cashed_out', False):
            emit('cash_out_response', {'success': False, 'message': 'تم السحب بالفعل'})
            return
        
        # حساب الربح
        multiplier = game_state['current_multiplier']
        bet_amount = player_data['bet_amount']
        profit = bet_amount * (multiplier - 1)
        
        # تحديث بيانات اللاعب
        player_data['cashed_out'] = True
        player_data['cash_out_multiplier'] = multiplier
        player_data['profit'] = profit
        player_data['result'] = 'win'
        
        # إرسال تأكيد للاعب
        emit('cash_out_response', {
            'success': True,
            'message': 'تم السحب بنجاح',
            'cash_out_data': {
                'player_id': player_id,
                'multiplier': multiplier,
                'profit': profit,
                'total_return': bet_amount + profit
            }
        })
        
        # إرسال تحديث للاعبين الآخرين
        socketio.emit('player_cashed_out', {
            'player_id': player_id,
            'username': player_data.get('username', f'لاعب_{player_id}'),
            'multiplier': multiplier,
            'profit': profit
        }, skip_sid=request.sid)

@app.route('/api/egypt-rocket/status')
def get_game_status():
    """الحصول على حالة اللعبة الحالية"""
    return jsonify({
        'is_active': game_state['is_active'],
        'current_round': game_state['current_round'],
        'current_multiplier': game_state['current_multiplier'],
        'round_start_time': game_state['round_start_time'],
        'last_results': game_state['last_results'],
        'online_players': 0  # تحديثها لاحقاً عند تنفيذ إدارة الاتصالات
    })

@app.route('/api/egypt-rocket/leaderboard')
def get_leaderboard():
    """الحصول على جدول التسجيل"""
    sorted_leaderboard = sorted(
        leaderboard.values(), 
        key=lambda x: x['total_profit'], 
        reverse=True
    )
    return jsonify(sorted_leaderboard[:20])  # إرجاع أفضل 20 لاعب

@app.route('/api/egypt-rocket/history')
def get_history():
    """الحصول على تاريخ الجولات"""
    limit = request.args.get('limit', default=20, type=int)
    history = game_state['round_history'][-limit:] if limit > 0 else game_state['round_history']
    return jsonify(history)

# بدء حلقة اللعبة في خيط منفصل
game_thread = threading.Thread(target=game_loop)
game_thread.daemon = True  # حتى يتم إنهاء الخيط عند إنهاء البرنامج الرئيسي
game_thread.start()

if __name__ == '__main__':
    # بدء الخادم
    port = int(os.environ.get('PORT', 3001))
    socketio.run(app, host='0.0.0.0', port=port, debug=True, use_reloader=False, log_output=True, allow_unsafe_werkzeug=True)