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