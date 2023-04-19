# Project Dependencies

To get started, you will need a Python environment which can run Django, and Postgres.

## Postgres
The recommended way to run Postgres is in a Docker container:

```python
docker run --name postgres \
    -e POSTGRES_PASSWORD=root \
    -e POSTGRES_USER=arc_iasc \
    -e POSTGRES_PASSWORD=1234 \
    -p"5432:5432/tcp" \
    -d postgres:15.2-alpine
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
conda install --file requirements.txt
```
