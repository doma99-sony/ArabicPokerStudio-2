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
from importlib import import_module

# إعداد التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("python_runner")

def start_realtime_server():
    """بدء تشغيل خادم التحديثات الفورية"""
    try:
        # استيراد وحدة realtime_server
        realtime_server = import_module("python.realtime_server")
        
        # بدء تشغيل الخادم
        server_thread = realtime_server.start_server_in_thread()
        
        logger.info("تم بدء تشغيل خادم التحديثات الفورية على المنفذ 3001")
        
        # إرجاع مرجع الخيط للاستخدام في المستقبل
        return server_thread
    except Exception as e:
        logger.error(f"فشل في بدء تشغيل خادم التحديثات الفورية: {str(e)}")
        return None

if __name__ == '__main__':
    """تشغيل نقطة الدخول الرئيسية"""
    logger.info("بدء تشغيل خدمات Python...")
    
    # بدء تشغيل خادم التحديثات الفورية
    server_thread = start_realtime_server()
    
    if server_thread:
        logger.info("تم بدء جميع الخدمات بنجاح")
        
        # الانتظار حتى يتم إيقاف العملية
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("تم إيقاف الخدمات من قبل المستخدم")
            sys.exit(0)
    else:
        logger.error("فشل في بدء الخدمات")
        sys.exit(1)