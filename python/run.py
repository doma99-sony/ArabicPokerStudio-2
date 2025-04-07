#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
صاروخ مصر - سكريبت التشغيل
=========================
هذا الملف يستخدم لتشغيل خادم التحديثات الفورية باستخدام FastAPI وWebSockets
"""

import os
import sys
import time
import threading
import logging
import subprocess
import signal
import uvicorn
import traceback

# استيراد محتويات الوحدة مباشرة إذا كانت متاحة
from python.realtime_server import app as fast_api_app

# إعداد التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("python_runner")

def start_realtime_server():
    """بدء تشغيل خادم التحديثات الفورية بشكل مباشر"""
    try:
        logger.info("بدء تشغيل خادم التحديثات الفورية على المنفذ 3005...")
        
        # تكوين وتشغيل Uvicorn مباشرة
        uvicorn.run(
            fast_api_app,
            host="0.0.0.0",
            port=3005,
            log_level="info"
        )
        
        return True
    except Exception as e:
        error_traceback = traceback.format_exc()
        logger.error(f"فشل في بدء تشغيل خادم التحديثات الفورية: {str(e)}\n{error_traceback}")
        return False

if __name__ == '__main__':
    """تشغيل نقطة الدخول الرئيسية"""
    logger.info("بدء تشغيل خدمات Python...")
    
    # محاولة بدء تشغيل الخادم بشكل مباشر
    success = start_realtime_server()
    
    if not success:
        logger.error("فشل في بدء الخدمات")
        sys.exit(1)