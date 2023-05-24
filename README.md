# IASCPolls

[![Unit Tests](https://github.com/DurhamARC/IASCPolls/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/DurhamARC/IASCPolls/actions/workflows/unit-tests.yml)
[![codecov.io](https://codecov.io/gh/DurhamARC/IASCPolls/branch/main/graphs/badge.svg)](https://codecov.io/gh/DurhamARC/IASCPolls/branch/main)
[![License: MIT](https://img.shields.io/github/license/DurhamARC/IASCPolls)](https://github.com/DurhamARC/IASCPolls/blob/main/LICENSE)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)


Polling System developed for the Institute for Ascertaining Scientific Consensus 
(IASC). This platform provides a tailored architecture for surveying consensus 
across the scientific community.

## Durham University Project Team

| Project Member                                       | Contact address                                                   | Role                             | Unit                                                                                |
|------------------------------------------------------|-------------------------------------------------------------------|----------------------------------|-------------------------------------------------------------------------------------|
| Dr. [Samantha Finnigan](github.com/sjmf)             | [samantha.finnigan@dur.ac.uk](mailto:samantha.finnigan@dur.ac.uk) | Research Software Engineer (RSE) | [Advanced Research Computing](https://www.dur.ac.uk/arc/rse/)                       |
| [Joanne Sheppard](github.com/joannercsheppard)       | [joanne.r.sheppard@dur.ac.uk](mailto:joanne.r.sheppard@dur.ac.uk) | Research Software Engineer (RSE) | [Advanced Research Computing](https://www.dur.ac.uk/arc/rse/)                       |
| Prof. [Peter Vickers](dur.ac.uk/staff/peter-vickers) | [peter.vickers@dur.ac.uk](mailto:peter.vickers@dur.ac.uk)         | IASC Principal Investigator      | [Department of Philosophy](https://www.durham.ac.uk/departments/academic/philosophy/) |


## Background

Humanity needs a way to pool scientific community opinion quickly and 
efficiently on a given statement of interest. This should be on a very large 
scale, such that one can have confidence that the result reflects international 
scientific opinion. For this pilot project (2022-23), Peter Vickers has built a 
network of 30+ academic institutions around the world. Personal, one-to-one 
emails are to be sent locally to all relevant scientists at those institutions, 
asking for a yes/no answer to a given question. The scientist answers by hitting 
a button embedded in the email, and confirming the response in a second step. 
Each scientist on our list should have one vote only, and nobody else gets to 
vote. Voting should be anonymous, with any 'token' linking the scientist to 
their vote being destroyed after voting. Votes should be tagged to academic 
department, and institution, for subsequent data analysis. Originally the 
project was set up with Word, Excel, and Microsoft Forms, but several problems 
were encountered; tailored architecture is needed.


## Getting Started

This project is developed in [Python Django](https://www.djangoproject.com/) and 
[React](https://reactjs.org/).

### Run Locally

There are some prerequisites to be aware of: please see [Dependencies](docs/DEPENDENCIES.md) for more information.

The django development server can be run using the command:

```
python manage.py runserver
```

### Linting

The [Black](https://github.com/psf/black) code style is used to lint this 
repository on-push. Set up a pre-commit hook to ensure that any code you push is 
passing this code style or Linting may fail for your commit. The 
`.pre-commit-config.yaml` file contains the configuration for this. You need to 
tell Git to run it with the following command:

```
pre-commit install
```

If you see `command not found: pre-commit`, you need to first install the 
[pre-commit framework](https://pre-commit.com/#install).

You can also run black manually by installing the python module and then 
`python -m black ./src`.


[//]: # (### Deployment)

## Contributing

Please feel free to comment on and create [issues](issues). When creating an 
issue, please use the correct issue template, e.g. for Bug Reports or Feature 
Requests.

### `main` Branch
Protected and should only be pushed to via pull requests. Should be considered 
stable and a representation of production code.

### `devel` Branch
Should be considered fragile, code should compile and run but features may be 
prone to errors.

### `feature` Branches
Feature branches should be created from the `main` and `devel` branches to track 
commits per feature being worked on. External developers should fork the 
repository and add their commits to a Pull Request. This follows the 
["github-flow" model of branching](https://docs.github.com/en/get-started/quickstart/github-flow).

### `release` Branch
Pushing to the `release` branch triggers the CI/CD workflow to build the Docker 
images and upload them to the [DurhamARC DockerHub](https://hub.docker.com/orgs/durhamarc/) 
repositories, then release to Azure and the backend servers. The release branch 
is protected and can only be pushed to by authorized members.

The release branch is managed by rebasing on top of the `main` branch and 
creating a tag. For example:

```shell
$ git checkout release
$ git rebase main
$ git tag -a v1.x -m "Release v1.x"
$ git push origin release v1.x
$ git checkout main
```


## Built With

We are using the following frameworks and tools to develop this software:

* [Django](https://www.djangoproject.com/)
* [React](https://reactjs.org/)
* [Docker](https://docker.io/)

A CI/CD pipeline is used to test and release this software, using 
[GitHub Actions](https://github.com/features/actions) and 
[Azure Pipelines](https://azure.microsoft.com/en-gb/products/devops/pipelines/). 


## License
This work is licensed under the [MIT License](LICENSE), a permissive license 
which allows Commercial use, Modification, and Distribution, but does not admit 
liability or warranty for use of this code.

## Acknowledgements
This project was supported by the Durham University Seedcorn project fund, Durham University Department of Philosophy, and the [Centre for Humanities Engaging Science and Society (CHESS)](https://www.durham.ac.uk/research/institutes-and-centres/humanities-engaging-science-society/).

[//]: # (## Citation)
[//]: # ()
[//]: # (Please cite the associated papers for this work if you use this code:)
[//]: # ()
[//]: # (```)
[//]: # (@article{xxx2021paper,)
[//]: # (  title={Title},)
[//]: # (  author={Author},)
[//]: # (  journal={arXiv},)
[//]: # (  year={2021})
[//]: # (})
[//]: # (```)

[//]: # (## Usage)
[//]: # ()
[//]: # (Any links to production environment, video demos and screenshots.)
[//]: # ()
[//]: # (## Roadmap)
[//]: # ()
[//]: # (- [x] Initial Research  )
[//]: # (- [x] Minimum viable product: )
[//]: # (- [ ] Alpha Release  )
[//]: # (- [ ] Feature-Complete Release  )

