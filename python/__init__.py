#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
صاروخ مصر - تطبيق بايثون
========================
هذا الملف يمثل نقطة الدخول للتطبيق
"""

try:
    from .egypt_rocket_server import app, socketio
    from .routes import api_bp
except ImportError:
    # عند التشغيل كوحدة رئيسية باستخدام python -m
    from egypt_rocket_server import app, socketio
    from routes import api_bp

# تسجيل مسارات API
app.register_blueprint(api_bp, url_prefix='/api/egypt-rocket')

# دالة بدء التشغيل للتطبيق
def start_egypt_rocket_server(port=3001, debug=True):
    """تشغيل خادم صاروخ مصر"""
    socketio.run(app, host='0.0.0.0', port=port, debug=debug, use_reloader=False, log_output=True, allow_unsafe_werkzeug=True)

if __name__ == '__main__':
    import sys
    # الحصول على رقم المنفذ من معلمات سطر الأوامر إذا تم تمريره
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3001
    print(f"بدء تشغيل خادم صاروخ مصر على المنفذ {port}...")
    start_egypt_rocket_server(port=port, debug=True)