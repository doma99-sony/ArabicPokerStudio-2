#!/bin/bash

# إعداد المتغيرات البيئية
export ROCKET_PORT=${ROCKET_PORT:-3001}
export PYTHONUNBUFFERED=1

# تشغيل خادم بايثون
echo "Starting Egypt Rocket Python server on port $ROCKET_PORT..."
cd python && python3 -m __init__ $ROCKET_PORT