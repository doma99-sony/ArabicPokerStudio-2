#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
صاروخ مصر - سكريبت تشغيل خادم التحديثات الفورية
=============================================
هذا الملف يقوم بتشغيل خادم FastAPI للتحديثات الفورية بشكل مباشر
"""

import sys
import os
from python.realtime_server import app
import uvicorn

# بدء تشغيل خادم التحديثات الفورية بشكل مباشر
if __name__ == "__main__":
    print("بدء تشغيل خادم التحديثات الفورية على المنفذ 3005...")
    
    try:
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=3005,
            log_level="info"
        )
    except Exception as e:
        print(f"حدث خطأ أثناء تشغيل خادم التحديثات الفورية: {str(e)}")
        sys.exit(1)