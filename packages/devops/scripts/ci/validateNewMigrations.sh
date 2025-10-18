#!/usr/bin/env bash
set -e

DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
ROOT="$DIR/../../../../"

. "$DIR/utils.sh"

function get_date_command() {
  if [[ $(uname) = Darwin ]]; then
    echo 'gdate' # install gdate on MacOs: brew install coreutils
  else
    echo 'date'
  fi
}

date_command=$(get_date_command)

function convert_timestamp_to_date() {
  local timestamp=$1
  local date=$($date_command -d @$timestamp '+%Y-%m-%d')
  echo "$date"
}

function check_migration_outdated() {
  local migration_name=$1

  included_date_offset=$((90 * 24 * 60 * 60 * 1000)) # include migrations up to 90 days old
  included_migrations_timestamp=$(($($date_command +%s) - included_date_offset / 1000))
  valid_migration_date=$(convert_timestamp_to_date "$included_migrations_timestamp")

  year=${migration_name:33:4}
  month=${migration_name:37:2}
  day=${migration_name:39:2}
  migration_timestamp=$($date_command -d "${year}-${month}-${day}" +%s)

  if ((migration_timestamp < included_migrations_timestamp)); then
    log_error "❌ New migration should be created after $valid_migration_date. Invalid migration name: '$migration_name'"
  fi
}

function validate_migrations() {
  local current_branch_name=$1
  local origin_branch_name=$2
  local migrations_dir="${ROOT}/packages/database/src/migrations"
  local new_migration_names_in_string=$(git diff --diff-filter=A --name-only $origin_branch_name $current_branch_name $migrations_dir)
  local errors=""

  while read -r migration_name; do
    if [[ $migration_name = '' ]]; then
      break
    fi
    errors="$errors$(check_migration_outdated "$migration_name")"
  done <<<"$new_migration_names_in_string"

  if [[ $errors != '' ]]; then
    echo "$errors"
    exit 1
  fi
}

current_branch_name=$(get_branch_name)
origin_branch_name='master'

# Skip validation if current branch name is master
if [[ $current_branch_name = "$origin_branch_name" ]]; then
  echo 'Skipping validation step while current branch is the same as origin'
  exit 0
fi

# Prevent error The authenticity of host 'github.com' can't be established.
# Long version: the git origin copied from codeship is using ssh, but the container doesn't have ssh setup. The quick way is to swith to https.
git remote remove origin
git remote add origin https://github.com/beyondessential/tupaia.git
# Remove this submodule because it uses ssh
git rm "$ROOT"/packages/data-api/scripts/pg-mv-fast-refresh

git fetch --quiet
git fetch origin "$origin_branch_name:$origin_branch_name" --quiet
validate_migrations "$current_branch_name" "$origin_branch_name"

log_success "✔ New migrations are valid!"
exit 0
