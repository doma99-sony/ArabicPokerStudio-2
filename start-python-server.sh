#!/bin/bash

# إعداد المتغيرات البيئية
export ROCKET_PORT=${ROCKET_PORT:-3001}
export PYTHONUNBUFFERED=1
export PYTHONPATH=$PYTHONPATH:$(pwd)

# تشغيل خادم بايثون
echo "Starting Egypt Rocket Python server on port $ROCKET_PORT..."
cd $(pwd)
echo "Current directory: $(pwd)"
echo "Python path: $PYTHONPATH"
echo "Installed Python packages:"
pip list | grep -E "flask|socketio|numpy|dotenv"

echo "Running Python server..."
python3 -m python.egypt_rocket_server $ROCKET_PORT