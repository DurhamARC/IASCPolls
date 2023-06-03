#
# Dockerfile: Build containers for the IASC polling site
#
# This is a multistage Dockerfile which produces a set of containers
# for the application. The stages are as follows:
#
#  1. (build_node)   – Build Node.js assets for the front-end website
#  2. (build_python) - Install python dependencies with conda and compress them
#
# These three containers are discarded at runtime and only produce compressed
# assets which are picked up by the following stage:
#
#  4. iasc           - Wrap all dependencies into a single python container
#
# Using a multistage Dockerfile increases the complexity of the build process,
#  but results in a significantly smaller final image. This is important when
#  we push the app up to a container repo, as excluding all the Conda and Node
#  dependencies saves about ~1.7GB of space (final image ~300MB instead of 2G).
#
# See: https://docs.docker.com/build/building/multi-stage/ for more info.
#
ARG PYTHON_VER 3.8
#
# ----------------------------------------------------------------------------
# Build node / Frontend assets
FROM node:alpine3.15 as build_node
MAINTAINER Samantha Finnigan <samantha.finnigan@durham.ac.uk>, ARC Durham University

# Install Python (required for node-gyp)
RUN apk add --update python3 make g++ && \
    rm -rf /var/cache/apk/*

# Based on https://cli.vuejs.org/guide/deployment.html#docker-nginx
WORKDIR /app

# Install app dependencies
COPY react-app/package.json .
RUN npm install

# Copy files and build app
ADD react-app /app/react-app
WORKDIR /app/react-app
RUN npm run webpack


# ----------------------------------------------------------------------------
# Create conda environment
FROM continuumio/miniconda3:4.12.0 as build_python

# This is how I used to do this: it's slower than using conda-lock
# https://pythonspeed.com/articles/conda-docker-image-size/
# Create the environment:
#COPY conf/iasc.base.yml .
#RUN --mount=type=cache,target=/opt/conda/pkgs \
#    conda env create -f iasc.base.yml

RUN conda create --name IASCPolls python=$PYTHON_VER
RUN --mount=type=cache,target=/opt/conda/pkgs \
    conda install -c conda-forge conda-lock conda-pack

# Install environment from conda-lock file
# Generate using:
# conda-lock -f conf/iasc.base.yml -p osx-64 -p linux-64 -p linux-aarch64 --lockfile conf/conda-lock.yml
COPY conf/conda-lock.yml .
RUN conda-lock install -n IASCPolls

# Use conda-pack to create a standalone enviornment
# in /venv:
RUN conda-pack -n IASCPolls -o /tmp/env.tar && \
  mkdir /venv && cd /venv && tar xf /tmp/env.tar && \
  rm /tmp/env.tar

# We've put venv in same path it'll be in final image,
# so now fix up paths:
RUN /venv/bin/conda-unpack

WORKDIR /app
SHELL ["/bin/bash", "--login", "-c"]


# ----------------------------------------------------------------------------
# Create a python Docker container for running the app with gunicorn and whitenoise
FROM debian:bullseye-slim as iasc
MAINTAINER Samantha Finnigan <samantha.finnigan@durham.ac.uk>, ARC Durham University
WORKDIR /app

# set environment variables (don't buffer stdout, don't write bytecode)
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV BASH_ENV "~/.bashrc"
# Avoid <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:1129)>
ENV SSL_CERT_FILE /etc/ssl/certs/ca-certificates.crt

# Replicate environment from miniconda image
RUN apt-get update -q && \
    apt-get install -q -y --no-install-recommends \
        nginx openssh-server ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy /venv from the previous stage:
COPY --from=build_node /app/frontend/static/dist /app/frontend/static/dist
COPY --from=build_node /app/react-app/webpack-stats.json /app/react-app/webpack-stats.json
COPY --from=build_python /venv /venv
ENV PATH /opt/conda/bin:$PATH

# Make RUN commands use the new environment:
RUN echo "source /venv/bin/activate" >> ${HOME}/.bashrc
SHELL ["/bin/bash", "--login", "-c"]
ENTRYPOINT ["/bin/bash", "--login", "-c"]

# Demonstrate the environment is activated:
RUN echo "Make sure django is installed:" && \
    python -c "import django"

# ssh
ENV SSH_PASSWD "root:Docker!"
RUN echo "$SSH_PASSWD" | chpasswd
COPY conf/sshd_config /etc/ssh/

# nginx
COPY conf/subsite.conf /etc/nginx/sites-available/default
RUN mkdir -p /data/nginx/cache

COPY iasc ./iasc
COPY frontend ./frontend
COPY manage.py .
COPY conf/init.sh /usr/local/bin/
RUN chmod u+x /usr/local/bin/init.sh

EXPOSE 8080 2222

# The code to run when container is started:
ENTRYPOINT ["init.sh"]
