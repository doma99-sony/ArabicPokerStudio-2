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

# التحقق من وجود ملف realtime_server
try:
    # استيراد وحدة realtime_server للتحقق من وجودها
    realtime_server = import_module("python.realtime_server")
    
    # التحقق من تطابق المسار
    logger.info(f"مسار الوحدة المستوردة: {realtime_server.__file__}")
    
    # تنبيه: لم يعد يتم تشغيل الخادم تلقائياً عند استيراد الوحدة
    # بدلاً من ذلك، يجب استخدام start_realtime_server.py
    logger.info("ملاحظة: لبدء تشغيل خادم التحديثات الفورية، استخدم: python start_realtime_server.py")
    
except Exception as e:
    logger.error(f"فشل في استيراد وحدة realtime_server: {str(e)}")
    logger.error(f"تفاصيل الخطأ: {traceback.format_exc()}")
    logger.error("ملاحظة: يجب التأكد من تثبيت جميع الحزم المطلوبة وصلاحية ملف realtime_server.py")