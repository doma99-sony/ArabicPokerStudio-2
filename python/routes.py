#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
صاروخ مصر - مسارات API
======================
هذا الملف يحتوي على مسارات API للتواصل بين الواجهة الأمامية وخادم بايثون
"""

from flask import Blueprint, jsonify, request
from .egypt_rocket_server import game_state, leaderboard

# إنشاء مسارات API
api_bp = Blueprint('egypt_rocket_api', __name__)

@api_bp.route('/status')
def get_game_status():
    """الحصول على حالة اللعبة الحالية"""
    return jsonify({
        'is_active': game_state['is_active'],
        'current_round': game_state['current_round'],
        'current_multiplier': game_state['current_multiplier'],
        'round_start_time': game_state['round_start_time'],
        'last_results': game_state['last_results']
    })

@api_bp.route('/leaderboard')
def get_leaderboard():
    """الحصول على جدول التسجيل"""
    sorted_leaderboard = sorted(
        leaderboard.values(), 
        key=lambda x: x['total_profit'], 
        reverse=True
    )
    return jsonify(sorted_leaderboard[:20])  # إرجاع أفضل 20 لاعب

@api_bp.route('/history')
def get_history():
    """الحصول على تاريخ الجولات"""
    limit = request.args.get('limit', default=20, type=int)
    history = game_state['round_history'][-limit:] if limit > 0 else game_state['round_history']
    return jsonify(history)