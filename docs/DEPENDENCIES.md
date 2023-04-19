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


