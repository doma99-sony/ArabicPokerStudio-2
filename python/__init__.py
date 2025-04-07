#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
صاروخ مصر - وحدة الدعم
==================
هذه الوحدة توفر دعماً للتحديثات الفورية باستخدام FastAPI و WebSockets
"""

import threading
import logging
import time
import sys
import traceback
import os
from importlib import import_module

# إعداد التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("python_module")

# التأكد من تثبيت الحزم المطلوبة
required_packages = ['fastapi', 'uvicorn', 'websockets']
missing_packages = []

try:
    import fastapi
    import uvicorn
    import websockets
    logger.info("تم التحقق من تثبيت جميع الحزم المطلوبة")
except ImportError as e:
    logger.error(f"خطأ في استيراد الحزم: {str(e)}")
    logger.error(f"تفاصيل الخطأ: {traceback.format_exc()}")
    logger.error("يرجى تثبيت الحزم المطلوبة قبل تشغيل الخادم")
    sys.exit(1)

# بدء تشغيل خادم التحديثات الفورية
try:
    # استيراد وحدة realtime_server
    realtime_server = import_module("python.realtime_server")
    
    # التحقق من تطابق المسار
    logger.info(f"مسار الوحدة المستوردة: {realtime_server.__file__}")
    
    # بدء تشغيل الخادم في خيط منفصل
    realtime_thread = realtime_server.start_server_in_thread()
    
    logger.info(f"تم بدء تشغيل خادم التحديثات الفورية على المنفذ 3001 (خيط: {realtime_thread.name})")
except Exception as e:
    logger.error(f"فشل في بدء تشغيل خادم التحديثات الفورية: {str(e)}")
    logger.error(f"تفاصيل الخطأ: {traceback.format_exc()}")
    logger.error("ملاحظة: يجب التأكد من تثبيت جميع الحزم المطلوبة وصلاحية ملف realtime_server.py")