#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
صاروخ مصر - خادم التحديثات الفورية
===========================
هذا الملف يوفر خادم FastAPI مع دعم WebSocket للتحديثات الفورية
ويمكنه إرسال التحديثات للمتصفح دون الحاجة لإعادة تحميل الصفحة
"""

# استيراد المكتبات اللازمة
import os
import json
import time
import asyncio
import logging
import threading
from typing import Dict, List, Optional, Set, Union, Any
from datetime import datetime
from contextlib import asynccontextmanager
from pydantic import BaseModel

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Request, status, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# إعداد التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("realtime_server")

# قاموس لتخزين اتصالات المستخدمين النشطة
active_connections: Dict[int, List[WebSocket]] = {}

# قاموس لتخزين التحديثات المؤقتة لكل مستخدم
user_updates: Dict[int, List[Dict[str, Any]]] = {}

# التخزين المؤقت للرسائل العامة
broadcast_messages: List[Dict[str, Any]] = []

# قواميس البوكر
poker_tables: Dict[int, Dict[str, Any]] = {}  # قاموس لتخزين طاولات البوكر {table_id: {players: {}, game_state: {}, ...}}
poker_connections: Dict[int, List[WebSocket]] = {}  # قاموس لتخزين اتصالات غرف البوكر {table_id: [connection1, connection2, ...]}
player_connection_map: Dict[str, Dict[str, Any]] = {}  # قاموس لربط اللاعبين بالاتصالات {player_id: {connection: WebSocket, table_id: int}}

# مدير الدخول/الخروج للتطبيق
@asynccontextmanager
async def lifespan(app: FastAPI):
    # التنظيف عند بدء التشغيل
    logger.info("بدء تشغيل خادم التحديثات الفورية")
    clear_old_data()
    
    # تنفيذ التطبيق
    yield
    
    # التنظيف عند الإغلاق
    logger.info("إيقاف خادم التحديثات الفورية")


# إنشاء تطبيق FastAPI
app = FastAPI(
    title="صاروخ مصر - خادم التحديثات الفورية",
    description="واجهة برمجة تطبيقات للتحديثات الفورية في لعبة صاروخ مصر",
    version="1.0.0",
    lifespan=lifespan
)

# إضافة دعم CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # في بيئة الإنتاج، حدد النطاقات المسموح بها
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# وظائف مساعدة
def clear_old_data():
    """تنظيف البيانات القديمة"""
    global broadcast_messages
    
    # الاحتفاظ فقط بأحدث 100 رسالة
    if len(broadcast_messages) > 100:
        broadcast_messages = broadcast_messages[-100:]
    
    # تنظيف التحديثات المؤقتة القديمة
    for user_id in user_updates:
        if len(user_updates[user_id]) > 50:
            user_updates[user_id] = user_updates[user_id][-50:]
    
    logger.info("تم تنظيف البيانات القديمة")


async def broadcast_to_all(message: Dict[str, Any]):
    """إرسال رسالة لجميع المستخدمين المتصلين"""
    disconnected_users = []
    
    # إضافة الرسالة إلى قائمة البث
    broadcast_messages.append(message)
    
    # التمرير على جميع المستخدمين النشطين
    for user_id, connections in active_connections.items():
        disconnected_connections = []
        
        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"خطأ أثناء البث للمستخدم {user_id}: {str(e)}")
                disconnected_connections.append(connection)
        
        # إزالة الاتصالات المقطوعة
        for conn in disconnected_connections:
            connections.remove(conn)
        
        # إذا لم تعد هناك اتصالات للمستخدم، أضفه إلى قائمة المستخدمين المنفصلين
        if not connections:
            disconnected_users.append(user_id)
    
    # إزالة المستخدمين المنفصلين
    for user_id in disconnected_users:
        del active_connections[user_id]
        logger.info(f"تمت إزالة المستخدم {user_id} بسبب انقطاع الاتصال")


async def send_to_user(user_id: int, message: Dict[str, Any]):
    """إرسال رسالة إلى مستخدم محدد"""
    if user_id not in active_connections:
        # تخزين الرسالة مؤقتًا إذا كان المستخدم غير متصل
        if user_id not in user_updates:
            user_updates[user_id] = []
        user_updates[user_id].append(message)
        return
    
    disconnected_connections = []
    
    for connection in active_connections[user_id]:
        try:
            await connection.send_json(message)
        except Exception as e:
            logger.error(f"خطأ أثناء إرسال رسالة للمستخدم {user_id}: {str(e)}")
            disconnected_connections.append(connection)
    
    # إزالة الاتصالات المقطوعة
    for conn in disconnected_connections:
        active_connections[user_id].remove(conn)
    
    # إذا لم تعد هناك اتصالات للمستخدم، احتفظ بالرسالة مؤقتًا
    if not active_connections[user_id]:
        if user_id not in user_updates:
            user_updates[user_id] = []
        user_updates[user_id].append(message)
        del active_connections[user_id]
        logger.info(f"تمت إزالة المستخدم {user_id} بسبب انقطاع الاتصال")


async def broadcast_to_table(table_id: int, message: Dict[str, Any]):
    """إرسال رسالة لجميع اللاعبين في طاولة البوكر"""
    disconnected_connections = []
    
    if table_id not in poker_connections:
        return
    
    # إرسال لجميع اللاعبين في الطاولة
    for connection in poker_connections[table_id]:
        try:
            await connection.send_json(message)
        except Exception as e:
            logger.error(f"خطأ أثناء البث لطاولة البوكر {table_id}: {str(e)}")
            disconnected_connections.append(connection)
    
    # إزالة الاتصالات المقطوعة
    for conn in disconnected_connections:
        poker_connections[table_id].remove(conn)
    
    # إذا لم تعد هناك اتصالات للطاولة، أزل الطاولة من القاموس
    if not poker_connections[table_id]:
        del poker_connections[table_id]
        # مسح بيانات الطاولة اختياريًا بعد فترة من الزمن
        # هنا يمكن إضافة منطق للاحتفاظ بالبيانات لفترة قبل حذفها


async def send_to_player(player_id: str, message: Dict[str, Any]):
    """إرسال رسالة إلى لاعب بوكر محدد"""
    if player_id not in player_connection_map:
        logger.warning(f"محاولة إرسال رسالة للاعب {player_id} غير متصل")
        return
    
    player_data = player_connection_map[player_id]
    connection = player_data.get("connection")
    
    # التحقق من وجود اتصال قبل محاولة إرسال الرسالة
    if not connection:
        logger.warning(f"محاولة إرسال رسالة للاعب {player_id} مع اتصال غير صالح")
        return
        
    try:
        await connection.send_json(message)
    except Exception as e:
        logger.error(f"خطأ أثناء إرسال رسالة للاعب {player_id}: {str(e)}")
        # إزالة اللاعب من خريطة الاتصالات
        table_id = player_data.get("table_id")
        if table_id and table_id in poker_connections:
            if connection in poker_connections[table_id]:
                poker_connections[table_id].remove(connection)
        del player_connection_map[player_id]


# طرق واجهة برمجة التطبيقات
@app.get("/")
async def get_status():
    """الحصول على حالة الخادم"""
    return {
        "status": "running",
        "message": "خادم التحديثات الفورية يعمل",
        "timestamp": datetime.now().isoformat(),
        "active_users": len(active_connections),
        "stored_messages": len(broadcast_messages)
    }


@app.get("/users")
async def get_active_users():
    """الحصول على قائمة المستخدمين النشطين"""
    return {
        "active_users": list(active_connections.keys()),
        "user_count": len(active_connections),
        "connections_per_user": {user_id: len(connections) for user_id, connections in active_connections.items()}
    }


@app.post("/broadcast")
async def send_broadcast_message(message: Dict[str, Any]):
    """إرسال رسالة إلى جميع المستخدمين المتصلين"""
    # إضافة طابع زمني
    message["timestamp"] = datetime.now().isoformat()
    
    # البث للجميع
    await broadcast_to_all(message)
    
    return {"success": True, "message": "تم إرسال الرسالة بنجاح"}


@app.post("/user/{user_id}/notify")
async def send_user_message(user_id: int, message: Dict[str, Any]):
    """إرسال رسالة إلى مستخدم محدد"""
    # إضافة طابع زمني
    message["timestamp"] = datetime.now().isoformat()
    
    # إرسال للمستخدم
    await send_to_user(user_id, message)
    
    return {"success": True, "message": f"تم إرسال الرسالة للمستخدم {user_id}"}


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """نقطة نهاية WebSocket للاتصال المستمر"""
    await websocket.accept()
    
    # إضافة الاتصال إلى القاموس
    if user_id not in active_connections:
        active_connections[user_id] = []
    active_connections[user_id].append(websocket)
    
    logger.info(f"اتصال جديد من المستخدم {user_id}")
    
    # إرسال رسالة ترحيب
    await websocket.send_json({
        "type": "connection_established",
        "message": "تم الاتصال بنجاح",
        "timestamp": datetime.now().isoformat(),
        "user_id": user_id
    })
    
    # إرسال التحديثات المخزنة مؤقتًا لهذا المستخدم إن وجدت
    if user_id in user_updates and user_updates[user_id]:
        for message in user_updates[user_id]:
            await websocket.send_json(message)
        # مسح التحديثات المؤقتة بعد إرسالها
        user_updates[user_id] = []
    
    # استمرار في الاستماع للرسائل
    try:
        while True:
            # انتظار رسائل من العميل
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                
                # معالجة الرسالة حسب نوعها
                if message.get("type") == "ping":
                    # رد على نبض الحياة
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    })
                elif message.get("type") == "broadcast":
                    # إعادة البث إلى جميع المستخدمين المتصلين
                    await broadcast_to_all({
                        "type": "broadcast",
                        "from_user": user_id,
                        "message": message.get("message", ""),
                        "timestamp": datetime.now().isoformat()
                    })
                elif message.get("type") == "local_update":
                    # التحديثات المحلية للبيانات عندما يكون الاتصال بالخادم الرئيسي غير متاح
                    logger.info(f"تحديث محلي وارد من المستخدم {user_id}: {message}")
                    data = message.get("data", {})
                    
                    # تأكيد استلام التحديث المحلي للعميل
                    if data and "user_id" in data:
                        # إرسال تأكيد التحديث المحلي
                        await send_to_user(int(data["user_id"]), {
                            "type": "local_update_confirmed",
                            "success": True,
                            "data": data,
                            "timestamp": datetime.now().isoformat()
                        })
                        
                        # يمكن إضافة المزيد من المنطق هنا للتعامل مع التحديثات المحلية
                        # مثل محاولة مزامنتها مع قاعدة البيانات إذا أمكن
                else:
                    # معالجة الرسائل الأخرى (توسيع هذا الجزء حسب الحاجة)
                    logger.info(f"رسالة واردة من المستخدم {user_id}: {message}")
            
            except json.JSONDecodeError:
                logger.warning(f"تم استلام رسالة غير صالحة من المستخدم {user_id}")
                await websocket.send_json({
                    "type": "error",
                    "message": "رسالة غير صالحة",
                    "timestamp": datetime.now().isoformat()
                })
    
    except WebSocketDisconnect:
        # إزالة الاتصال من القاموس
        if user_id in active_connections:
            if websocket in active_connections[user_id]:
                active_connections[user_id].remove(websocket)
            
            # إذا لم تعد هناك اتصالات للمستخدم، أزل المستخدم من القاموس
            if not active_connections[user_id]:
                del active_connections[user_id]
        
        logger.info(f"انقطع اتصال المستخدم {user_id}")
    
    except Exception as e:
        logger.error(f"حدث خطأ في اتصال المستخدم {user_id}: {str(e)}")


@app.websocket("/ws/poker")
async def poker_websocket_endpoint(websocket: WebSocket):
    """نقطة نهاية WebSocket للعبة البوكر"""
    await websocket.accept()
    logger.info("اتصال WebSocket جديد للعبة البوكر")
    
    # إرسال رسالة ترحيب
    await websocket.send_json({
        "type": "connection_established",
        "message": "تم الاتصال بخادم البوكر بنجاح",
        "timestamp": datetime.now().isoformat()
    })
    
    player_id = None
    table_id = None
    
    try:
        while True:
            # انتظار رسائل من العميل
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                logger.info(f"رسالة بوكر واردة: {message}")
                
                message_type = message.get("type")
                
                # معالجة الرسالة حسب نوعها
                if message_type == "ping":
                    # رد على نبض الحياة
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    })
                
                elif message_type == "join_table":
                    # انضمام إلى طاولة بوكر
                    table_id = message.get("tableId")
                    player_info = message.get("data", {})
                    player_id = player_info.get("playerId") or str(player_info.get("username", "unknown"))
                    
                    if not table_id:
                        await websocket.send_json({
                            "type": "error",
                            "message": "معرف الطاولة مطلوب للانضمام",
                            "timestamp": datetime.now().isoformat()
                        })
                        continue
                    
                    # إضافة الاتصال إلى قواميس البوكر
                    if table_id not in poker_connections:
                        poker_connections[table_id] = []
                    poker_connections[table_id].append(websocket)
                    
                    # ربط اللاعب بالاتصال والطاولة
                    player_connection_map[player_id] = {
                        "connection": websocket,
                        "table_id": table_id,
                        "info": player_info
                    }
                    
                    # إضافة اللاعب إلى الطاولة
                    if table_id not in poker_tables:
                        poker_tables[table_id] = {
                            "players": {},
                            "game_state": {
                                "phase": "waiting",
                                "pot": 0,
                                "community_cards": [],
                                "current_player": None,
                                "dealer_position": 0,
                                "blind_amount": player_info.get("blindAmount", 10),
                                "min_bet": player_info.get("blindAmount", 10) * 2
                            }
                        }
                    
                    poker_tables[table_id]["players"][player_id] = player_info
                    
                    # إعلام جميع اللاعبين في الطاولة بالانضمام
                    await broadcast_to_table(table_id, {
                        "type": "player_joined",
                        "data": player_info,
                        "tableId": table_id,
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    # إرسال حالة اللعبة الحالية للاعب المنضم
                    await websocket.send_json({
                        "type": "game_state",
                        "tableId": table_id,
                        "data": poker_tables[table_id]["game_state"],
                        "players": poker_tables[table_id]["players"],
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    logger.info(f"انضم اللاعب {player_id} إلى طاولة البوكر {table_id}")
                
                elif message_type == "leave_table":
                    # مغادرة طاولة البوكر
                    if player_id and player_id in player_connection_map:
                        table_data = player_connection_map[player_id]
                        table_id = table_data.get("table_id")
                        
                        if table_id and table_id in poker_tables and player_id in poker_tables[table_id]["players"]:
                            # إزالة اللاعب من الطاولة
                            del poker_tables[table_id]["players"][player_id]
                            
                            # إعلام جميع اللاعبين في الطاولة بالمغادرة
                            await broadcast_to_table(table_id, {
                                "type": "player_left",
                                "playerId": player_id,
                                "tableId": table_id,
                                "timestamp": datetime.now().isoformat()
                            })
                            
                            logger.info(f"غادر اللاعب {player_id} طاولة البوكر {table_id}")
                        
                        # إزالة اللاعب من خريطة الاتصالات
                        del player_connection_map[player_id]
                
                elif message_type == "player_action":
                    # إجراء اللاعب (مثل المراهنة، الطي، إلخ)
                    if not player_id or not table_id:
                        await websocket.send_json({
                            "type": "error",
                            "message": "يجب الانضمام إلى طاولة أولاً",
                            "timestamp": datetime.now().isoformat()
                        })
                        continue
                    
                    action = message.get("action")
                    amount = message.get("amount", 0)
                    
                    if table_id in poker_tables:
                        # تحديث حالة اللعبة (هنا سيكون المنطق الكامل للعبة البوكر)
                        # لأغراض هذا المثال، نقوم فقط بإعادة توجيه الإجراء إلى جميع اللاعبين
                        
                        # إعلام جميع اللاعبين في الطاولة بالإجراء
                        await broadcast_to_table(table_id, {
                            "type": "action_result",
                            "playerId": player_id,
                            "action": action,
                            "amount": amount,
                            "tableId": table_id,
                            "timestamp": datetime.now().isoformat()
                        })
                        
                        logger.info(f"قام اللاعب {player_id} بإجراء {action} بمبلغ {amount} في طاولة {table_id}")
                
                elif message_type == "chat_message":
                    # رسالة دردشة
                    if not player_id or not table_id:
                        await websocket.send_json({
                            "type": "error",
                            "message": "يجب الانضمام إلى طاولة أولاً",
                            "timestamp": datetime.now().isoformat()
                        })
                        continue
                    
                    message_text = message.get("message", "")
                    
                    if table_id in poker_connections:
                        # إرسال رسالة الدردشة إلى جميع اللاعبين في الطاولة
                        player_name = "مجهول"
                        if player_id in player_connection_map:
                            player_info = player_connection_map[player_id].get("info", {})
                            player_name = player_info.get("username", player_id)
                        
                        await broadcast_to_table(table_id, {
                            "type": "chat_message",
                            "senderId": player_id,
                            "senderName": player_name,
                            "message": message_text,
                            "tableId": table_id,
                            "timestamp": datetime.now().isoformat()
                        })
                        
                        logger.info(f"رسالة دردشة من اللاعب {player_id} في طاولة {table_id}: {message_text}")
                
                else:
                    # رسائل أخرى غير معروفة
                    logger.warning(f"نوع رسالة غير معروف من اتصال البوكر: {message_type}")
                    await websocket.send_json({
                        "type": "error",
                        "message": "نوع رسالة غير معروف",
                        "timestamp": datetime.now().isoformat()
                    })
            
            except json.JSONDecodeError:
                logger.warning("تم استلام رسالة غير صالحة من اتصال البوكر")
                await websocket.send_json({
                    "type": "error",
                    "message": "رسالة غير صالحة",
                    "timestamp": datetime.now().isoformat()
                })
    
    except WebSocketDisconnect:
        # تنظيف عند قطع الاتصال
        if player_id and player_id in player_connection_map:
            table_data = player_connection_map[player_id]
            table_id = table_data.get("table_id")
            
            if table_id:
                # إزالة الاتصال من قائمة اتصالات الطاولة
                if table_id in poker_connections and websocket in poker_connections[table_id]:
                    poker_connections[table_id].remove(websocket)
                
                # إزالة اللاعب من الطاولة
                if table_id in poker_tables and player_id in poker_tables[table_id]["players"]:
                    del poker_tables[table_id]["players"][player_id]
                    
                    # إعلام جميع اللاعبين في الطاولة بالمغادرة
                    await broadcast_to_table(table_id, {
                        "type": "player_left",
                        "playerId": player_id,
                        "tableId": table_id,
                        "timestamp": datetime.now().isoformat()
                    })
            
            # إزالة اللاعب من خريطة الاتصالات
            del player_connection_map[player_id]
        
        logger.info(f"انقطع اتصال لاعب البوكر {player_id}")
    
    except Exception as e:
        logger.error(f"حدث خطأ في اتصال البوكر: {str(e)}")
        if player_id and player_id in player_connection_map:
            del player_connection_map[player_id]


# وظيفة لبدء الخادم
def start_realtime_server(host="0.0.0.0", port=3001, log_level="info"):
    """بدء تشغيل خادم التحديثات الفورية"""
    try:
        uvicorn.run(
            "python.realtime_server:app",
            host=host,
            port=port,
            log_level=log_level,
            reload=False  # تعطيل إعادة التحميل التلقائي في بيئة الإنتاج
        )
    except Exception as e:
        logger.error(f"فشل في بدء خادم التحديثات الفورية: {str(e)}")


# بدء تشغيل الخادم في خيط منفصل عند استيراد الوحدة بشكل واضح
def start_server_in_thread():
    """بدء تشغيل الخادم في خيط منفصل عندما يطلب ذلك بشكل صريح"""
    logger.info("تم طلب بدء الخادم في خيط منفصل (هذه الطريقة لم تعد مستخدمة)")
    # قمنا بإيقاف تشغيل هذه الوظيفة لتجنب تعدد الخيوط
    # والاعتماد على start_realtime_server.py الرئيسي بدلاً من ذلك
    return None


# إذا تم تشغيل الملف مباشرة
if __name__ == "__main__":
    # تنبيه أن هذا الملف يجب استدعاؤه من start_realtime_server.py
    logger.info("يجب تشغيل الخادم من start_realtime_server.py وليس مباشرة")