# Project Dependencies

To get started, you will need a Python environment which can run Django, and Postgres, the database server.

## Postgres
The recommended way to run Postgres is in a Docker container:

```shell
docker run --name postgres \
    -e POSTGRES_PASSWORD=root \
    -e POSTGRES_USER=arc_iasc \
    -e POSTGRES_PASSWORD=1234 \
    -p"5432:5432/tcp" \
    -d postgres:15.2-alpine
```

You can check it is running using the command line client. Install it using:

OSX: `brew install libpq`  
Linux: `sudo apt-get install postgresql-client` (Debian/Ubuntu)

Then, try connecting to the running database using:

```shell
psql -h localhost --user arc_iasc -W
```


### Install Dependencies

Python dependencies are included in the file `requirements.txt`. This can be installed using the `pip` or `conda` dependency managers. 

Pip:
```
pip install -r requirements.txt
```

Conda:
```
conda create --name IASCPolls
conda activate IASCPolls
conda install -c conda-forge --file requirements.txt
```

### Build React App

Use npm to build the React app statically with webpack, into the correct directory:

```shell
cd react-app
npm run webpack
```

### Run the server:

Two ways of running the server exist: with the Django dev server, and with gunicorn:

```shell
DEBUG=True python manage.py runserver
# OR:
gunicorn \
  --bind=0.0.0.0:5000 \
  --access-logfile - \
  --log-level=debug \
  iasc.wsgi
```
