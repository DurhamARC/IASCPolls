#!/bin/bash
set -e

echo "Starting SSH ..."
service ssh start

#echo "Starting nginx..."
#nginx -t
#service nginx start

cd /app

python manage.py migrate
python manage.py collectstatic --noinput

gunicorn --timeout=300 --log-file=- --access-logfile '-'\
        --log-level=debug --bind=$BIND_ADDRESS iasc.wsgi
