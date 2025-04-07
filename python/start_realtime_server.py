#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
صاروخ مصر - سكريبت تشغيل خادم التحديثات الفورية
=============================================
هذا الملف يقوم بتشغيل خادم FastAPI للتحديثات الفورية بشكل مباشر
"""

import os
import sys
import logging
import traceback
import importlib.util

# إضافة المسار الحالي إلى مسار Python
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(current_dir)

# إعداد التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("realtime_starter")

def load_module(module_path):
    """تحميل وحدة بناءً على المسار الكامل للملف"""
    module_name = os.path.basename(module_path).replace('.py', '')
    spec = importlib.util.spec_from_file_location(module_name, module_path)
    if not spec:
        raise ImportError(f"لا يمكن تحميل الوحدة من المسار: {module_path}")
    
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def main():
    """تشغيل خادم التحديثات الفورية بشكل مباشر"""
    logger.info("بدء تشغيل خادم التحديثات الفورية...")
    
    try:
        # التحقق من تثبيت المكتبات المطلوبة
        try:
            import fastapi
            import uvicorn
            import websockets
            logger.info("تم التحقق من تثبيت جميع المكتبات المطلوبة")
        except ImportError as e:
            logger.error(f"خطأ: المكتبات المطلوبة غير متوفرة - {str(e)}")
            logger.error("يرجى تثبيت المكتبات المطلوبة: fastapi, uvicorn, websockets")
            return 1
        
        # تحديد مسار ملف realtime_server.py
        realtime_server_path = os.path.join(current_dir, 'python', 'realtime_server.py')
        logger.info(f"محاولة تحميل الخادم من: {realtime_server_path}")
        
        # التحقق من وجود الملف
        if not os.path.exists(realtime_server_path):
            logger.error(f"ملف الخادم غير موجود في المسار: {realtime_server_path}")
            return 1
        
        # محاولة استيراد الوحدة من المسار المباشر
        try:
            realtime_server = load_module(realtime_server_path)
            app = realtime_server.app
            logger.info(f"تم تحميل تطبيق FastAPI بنجاح: {app}")
        except Exception as import_error:
            logger.error(f"فشل في تحميل وحدة realtime_server: {str(import_error)}")
            logger.error(traceback.format_exc())
            return 1
        
        # تشغيل الخادم
        logger.info("بدء تشغيل خادم FastAPI على المنفذ 3005...")
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=3005, 
            log_level="info"
        )
        
        return 0
        
    except Exception as e:
        logger.error(f"حدث خطأ أثناء محاولة تشغيل الخادم: {str(e)}")
        logger.error(traceback.format_exc())
        return 1

if __name__ == "__main__":
    sys.exit(main())