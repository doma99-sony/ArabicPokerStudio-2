#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
صاروخ مصر - سكريبت تشغيل خادم التحديثات الفورية
=============================================
هذا الملف يقوم بتشغيل خادم FastAPI للتحديثات الفورية بشكل مباشر
"""

import sys
import os
import logging
import threading
import signal
import time

# إعداد التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("realtime_starter")

def check_port_in_use(port):
    """التحقق مما إذا كان المنفذ قيد الاستخدام بالفعل"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def kill_process_on_port(port):
    """قتل العملية التي تستخدم المنفذ المحدد"""
    try:
        import subprocess
        result = subprocess.run(['lsof', '-i', f':{port}', '-t'], capture_output=True, text=True)
        if result.stdout:
            pids = result.stdout.strip().split('\n')
            for pid in pids:
                if pid:
                    try:
                        os.kill(int(pid), signal.SIGTERM)
                        logger.info(f"تم إيقاف العملية {pid} على المنفذ {port}")
                    except ProcessLookupError:
                        continue
                    except Exception as e:
                        logger.error(f"خطأ في إيقاف العملية {pid}: {str(e)}")
        return True
    except Exception as e:
        logger.error(f"خطأ في البحث عن العمليات على المنفذ {port}: {str(e)}")
        return False

def start_server():
    """تشغيل خادم التحديثات الفورية"""
    try:
        # استيراد المكتبات اللازمة في نطاق هذه الوظيفة
        try:
            import uvicorn
            import fastapi
            import websockets
        except ImportError as e:
            logger.error(f"المكتبات المطلوبة غير متوفرة: {str(e)}")
            logger.error("يرجى تثبيت: fastapi uvicorn websockets")
            return False

        # التحقق مما إذا كان المنفذ قيد الاستخدام وإيقاف العملية إذا لزم الأمر
        port = 3001
        if check_port_in_use(port):
            logger.warning(f"المنفذ {port} قيد الاستخدام بالفعل. محاولة إيقاف العملية...")
            if not kill_process_on_port(port):
                logger.error(f"تعذر إيقاف العملية على المنفذ {port}. يرجى إيقافها يدويًا.")
                return False
            # انتظار قليلاً حتى يتم تحرير المنفذ
            time.sleep(1)

        print(f"بدء تشغيل خادم التحديثات الفورية على المنفذ {port}...")
        uvicorn.run(
            "python.realtime_server:app",
            host="0.0.0.0",
            port=port,
            log_level="info"
        )
        return True
    except Exception as e:
        logger.error(f"حدث خطأ أثناء تشغيل خادم التحديثات الفورية: {str(e)}")
        return False

# بدء تشغيل خادم التحديثات الفورية بشكل مباشر
if __name__ == "__main__":
    success = start_server()
    if not success:
        sys.exit(1)