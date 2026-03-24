#!/usr/bin/env bash
set -euo pipefail

# ── Colours ────────────────────────────────────────────────────────────────────
BOLD="\033[1m"
RESET="\033[0m"
GREEN="\033[1;32m"
CYAN="\033[1;36m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
DIM="\033[2m"

info()    { echo -e "${CYAN}▶  $*${RESET}"; }
success() { echo -e "${GREEN}✔  $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  $*${RESET}"; }
header()  { echo -e "\n${BOLD}$*${RESET}"; }
divider() { echo -e "${DIM}──────────────────────────────────────────────────${RESET}"; }

# ── Load .env ──────────────────────────────────────────────────────────────────
if [ -f .env ]; then
    info "Loading environment from .env"
    set -o allexport
    # shellcheck disable=SC1091
    source .env
    set +o allexport
    success "Environment loaded"
else
    warn ".env not found — using existing environment"
fi

# Override DB_HOST for local dev (postgres runs on localhost, not the 'postgres' hostname)
export DB_HOST=127.0.0.1

divider

# ── Python environment ─────────────────────────────────────────────────────────
header "1 / 5  Python environment"

CONDA_ENV="iasc"
CONDA_BASE_YML="conf/iasc.base.yml"

if command -v conda &>/dev/null; then
    # Resolve conda's shell functions (not available in plain bash)
    # shellcheck disable=SC1091
    source "$(conda info --base)/etc/profile.d/conda.sh"

    if conda env list --json | python3 -c "import sys,json; envs=json.load(sys.stdin)['envs']; exit(0 if any('/${CONDA_ENV}' in e for e in envs) else 1)" 2>/dev/null; then
        info "Activating conda environment '${CONDA_ENV}'…"
    else
        warn "Conda environment '${CONDA_ENV}' not found — creating from ${CONDA_BASE_YML}…"
        conda env create -f "${CONDA_BASE_YML}"
        success "Conda environment created"
    fi

    conda activate "${CONDA_ENV}"
    success "Using conda env: ${CONDA_ENV} ($(python --version))"
else
    warn "conda not found — checking pip dependencies…"
    if ! python -c "import django" &>/dev/null; then
        info "Installing from requirements.txt…"
        pip install -r requirements.txt
        success "pip dependencies installed"
    else
        success "pip dependencies already satisfied"
    fi
fi

divider

# ── React build ────────────────────────────────────────────────────────────────
header "2 / 5  React build"

REQUIRED_NODE_MAJOR=22
CURRENT_NODE_MAJOR=$(node --version 2>/dev/null | sed 's/v\([0-9]*\).*/\1/')
if [ -z "${CURRENT_NODE_MAJOR}" ]; then
    echo -e "${RED}✘  node not found — install Node ${REQUIRED_NODE_MAJOR} LTS (nvm install lts/jod)${RESET}"
    exit 1
elif [ "${CURRENT_NODE_MAJOR}" -ne "${REQUIRED_NODE_MAJOR}" ]; then
    warn "Node ${CURRENT_NODE_MAJOR} active, expected ${REQUIRED_NODE_MAJOR} — run: nvm use"
fi

info "Running webpack…"
pushd ./react-app/ > /dev/null
npm run webpack
popd > /dev/null
success "Webpack build complete"

divider

# ── PostgreSQL ─────────────────────────────────────────────────────────────────
header "3 / 5  PostgreSQL"
if docker ps --format '{{.Names}}' | grep -q '^postgres$'; then
    warn "Container 'postgres' already running — skipping docker run"
else
    info "Starting postgres:15.2-alpine container…"
    docker run --rm --name postgres \
        -e POSTGRES_USER="${DB_USER:-arc_iasc}" \
        -e POSTGRES_PASSWORD="${DB_PASS:-1234}" \
        -p "5432:5432/tcp" \
        -d postgres:15.2-alpine
    info "Waiting for PostgreSQL to become ready…"
    until docker exec postgres pg_isready -q 2>/dev/null; do sleep 0.5; done
    success "PostgreSQL is ready"
fi

divider

# ── Django setup ───────────────────────────────────────────────────────────────
header "4 / 5  Django setup"

info "Running migrations…"
python manage.py migrate
success "Migrations applied"

info "Creating superuser (admin / admin) — ignoring if already exists…"
DJANGO_SUPERUSER_PASSWORD=admin \
    python manage.py createsuperuser \
        --username admin \
        --email admin@example.com \
        --noinput 2>/dev/null \
    && success "Superuser created" \
    || warn "Superuser already exists — skipped"

info "Loading fixtures…"
python manage.py loaddata iasc/fixtures/*.json
success "Fixtures loaded"

divider

# ── Dev server ─────────────────────────────────────────────────────────────────
header "5 / 5  Dev server"
info "Starting Django development server at http://127.0.0.1:8000"
echo -e "${DIM}  Press Ctrl+C to stop${RESET}\n"
python manage.py runserver || true

# ── Teardown ───────────────────────────────────────────────────────────────────
divider
warn "Dev server stopped."
echo -e "${YELLOW}  Press Ctrl+C within 3 s to leave PostgreSQL running, or wait to stop it.${RESET}"
sleep 3

info "Stopping postgres container…"
docker stop postgres
success "PostgreSQL stopped. Goodbye!"
