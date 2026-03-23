# Project Dependencies

To get started, you will need a Python environment which can run Django, and Postgres, the database server.

## Postgres
The recommended way to run Postgres is in a Docker container:

```shell
docker run --name postgres \
    -e POSTGRES_USER=arc_iasc \
    -e POSTGRES_PASSWORD=1234 \
    -p "5432:5432/tcp" \
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

Conda (requirements.txt):
```
conda create --name iasc
conda activate iasc
conda install -c conda-forge --file requirements.txt
```

Conda (YAML)
```
conda env create -f conf/iasc.base.yml
conda activate iasc
conda env update --file conf/iasc.dev.yml
```

If you receive the error `django.core.exceptions.ImproperlyConfigured: Error loading psycopg2 module: No module named 'psycopg2'` when running on an M1 Mac, then run the following to correct it:

```shell
pip install psycopg2-binary
```

### Install Node.js

Node.js and npm are required to build the React frontend. The project targets **Node 22 LTS (lts/jod)**, which matches the Docker production build (`node:lts-alpine3.22`). An `.nvmrc` file is provided; if you use nvm:

```shell
nvm install   # installs the version in .nvmrc
nvm use       # switches to it
```

Or via conda (installs into the active environment):

```shell
conda install -c conda-forge nodejs
```

Or via Homebrew on macOS:

```shell
brew install node
```

### Build React App

Use npm to build the React app statically with webpack, into the correct directory:

```shell
cd react-app
npm install
npm run webpack
```

### Update Dependencies

> **Note:** `conda-lock` is not in `iasc.dev.yml` because it conflicts with Python 3.12 on conda-forge, which breaks CI. Install it separately when you need to regenerate the lock file:
> ```shell
> pip install conda-lock
> 
```

```
# Regenerate conda-lock.yml
conda-lock -f conf/iasc.base.yml -p osx-arm64 -p osx-64 -p linux-64 -p linux-aarch64 --lockfile conf/conda-lock.yml
```

```
# Update package.json and package-lock.json
npm update --save
npm audit fix
```

### Set up the Database using Django

You will need to use Django to set up the database correctly. `cd` back to the root of the project and:

#### Create a superuser
You can create a database superuser using the command:

```shell
python manage.py createsuperuser
```

OR, you can also do this in one step with the following command:
```shell
DJANGO_SUPERUSER_PASSWORD=password python manage.py createsuperuser --username root --email webmaster@localhost --noinput
```

#### Run the database migrations

```shell
python manage.py migrate
```

#### Load Fixtures
(OPTIONALLY) Load the fixtures for example data:
```shell
python manage.py loaddata iasc/fixtures/*.json
```

### Run the server:

Two ways of running the server exist: with the Django dev server, and with gunicorn:

```shell
DEBUG=True python manage.py runserver
# OR:
gunicorn \
  --bind=0.0.0.0:5100 \
  --access-logfile - \
  --log-level=debug \
  iasc.wsgi
```
