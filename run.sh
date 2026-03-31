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

require_binary() {
    local binary="$1"

    if ! command -v "${binary}" &>/dev/null; then
        MISSING_BINARIES+=("${binary}")
    fi
}

# ── Prerequisite checks ───────────────────────────────────────────────────────
MISSING_BINARIES=()

for binary in python node npm docker nc grep; do
    require_binary "${binary}"
done

if ! command -v conda &>/dev/null; then
    require_binary pip
fi

if [ "${#MISSING_BINARIES[@]}" -gt 0 ]; then
    header "Missing required tools"
    for binary in "${MISSING_BINARIES[@]}"; do
        echo -e "${RED}✘  ${binary} is required by run.sh but is not on PATH${RESET}"
    done
    echo
    warn "Install the missing tools, restart your shell if needed, then rerun ./run.sh"
    exit 1
fi

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

    if conda env list --json | python -c "import sys,json; envs=json.load(sys.stdin)['envs']; exit(0 if any('/${CONDA_ENV}' in e for e in envs) else 1)" 2>/dev/null; then
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
CURRENT_NODE_VERSION=$(node --version 2>/dev/null || true)
CURRENT_NODE_MAJOR=${CURRENT_NODE_VERSION#v}
CURRENT_NODE_MAJOR=${CURRENT_NODE_MAJOR%%.*}
if [ -z "${CURRENT_NODE_MAJOR}" ]; then
    echo -e "${RED}✘  node not found — install Node ${REQUIRED_NODE_MAJOR} LTS (nvm install lts/jod)${RESET}"
    exit 1
elif [ "${CURRENT_NODE_MAJOR}" -ne "${REQUIRED_NODE_MAJOR}" ]; then
    warn "Node ${CURRENT_NODE_MAJOR} active, expected ${REQUIRED_NODE_MAJOR} — run: nvm use"
fi

info "Running initial webpack build…"
pushd ./react-app/ > /dev/null
npm run webpack
popd > /dev/null
success "Webpack build complete"

info "Starting webpack in watch mode…"
pushd ./react-app/ > /dev/null
npm run dev &
WEBPACK_PID=$!
popd > /dev/null
success "Webpack watching for changes (pid ${WEBPACK_PID})"

divider

# ── PostgreSQL ─────────────────────────────────────────────────────────────────
header "3 / 5  PostgreSQL"
POSTGRES_STARTED=false
if nc -z 127.0.0.1 5432 2>/dev/null; then
    warn "Port 5432 already in use — skipping docker run"
elif docker ps --format '{{.Names}}' | grep -q '^postgres$'; then
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
    POSTGRES_STARTED=true
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
info "Stopping webpack watcher (pid ${WEBPACK_PID})…"
kill "${WEBPACK_PID}" 2>/dev/null && success "Webpack stopped" || true
if [ "${POSTGRES_STARTED}" = true ]; then
    echo -e "${YELLOW}  Press Ctrl+C within 3 s to leave PostgreSQL running, or wait to stop it.${RESET}"
    sleep 3
    info "Stopping postgres container…"
    docker stop postgres
    success "PostgreSQL stopped. Goodbye!"
else
    success "Goodbye!"
fi
