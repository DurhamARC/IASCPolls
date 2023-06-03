#!/bin/bash
set -e

echo "Starting SSH ..."
service ssh start

echo "Starting nginx..."
nginx -t
touch /var/log/nginx/access.log /var/log/nginx/error.log
ln -sf /dev/stdout /var/log/nginx/access.log
ln -sf /dev/stderr /var/log/nginx/error.log
service nginx start

cd /app

python manage.py migrate
python manage.py collectstatic --noinput

gunicorn --workers 3 --timeout=20 \
         --log-file=- --log-level=info --bind=127.0.0.1:5000 iasc.wsgi
