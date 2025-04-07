#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
صاروخ مصر - سكريبت التشغيل
=========================
هذا الملف يستخدم لتشغيل خادم صاروخ مصر
"""

import os
from . import start_egypt_rocket_server

if __name__ == '__main__':
    # احصل على رقم المنفذ من متغيرات البيئة أو استخدم 3001 كقيمة افتراضية
    port = int(os.environ.get('ROCKET_PORT', 3001))
    print(f"بدء تشغيل خادم صاروخ مصر على المنفذ {port}...")
    start_egypt_rocket_server(port=port, debug=True)