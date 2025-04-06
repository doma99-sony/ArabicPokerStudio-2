#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
صاروخ مصر - تطبيق بايثون
========================
هذا الملف يمثل نقطة الدخول للتطبيق
"""

import sys
import os

# دالة بدء التشغيل للتطبيق
def start_egypt_rocket_server(port=3001, debug=True):
    """تشغيل خادم صاروخ مصر"""
    try:
        from .egypt_rocket_server import app, socketio
        from .routes import api_bp
    except ImportError:
        # عند التشغيل كوحدة رئيسية باستخدام python -m
        from python.egypt_rocket_server import app, socketio
        from python.routes import api_bp
    
    # تسجيل مسارات API
    app.register_blueprint(api_bp, url_prefix='/api/egypt-rocket')
    
    print(f"Starting Egypt Rocket server on port {port}, debug={debug}")
    socketio.run(app, host='0.0.0.0', port=port, debug=debug, use_reloader=False, log_output=True, allow_unsafe_werkzeug=True)

if __name__ == '__main__':
    # الحصول على رقم المنفذ من معلمات سطر الأوامر إذا تم تمريرها
    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('ROCKET_PORT', 3001))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1', 't')
    
    print(f"Starting Egypt Rocket server from __init__.py with port={port}")
    start_egypt_rocket_server(port=port, debug=debug)