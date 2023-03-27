#!/bin/bash -e

DIR=$(dirname "$0")
ROOT="$(git rev-parse --show-toplevel)"

. ${DIR}/utils.sh

function get_date_command() {
  if [[ $(uname) == "Darwin" ]]; then
    echo "gdate" # install gdate on MacOs: brew install coreutils
  else
    echo "date"
  fi
}

date_command=$(get_date_command)

function convert_timestamp_to_date() {
  local timestamp=$1
  local date=$($date_command -d @$timestamp '+%Y-%m-%d')
  echo $date
}


function check_migration_outdated() {
  local migration_name=$1

  included_date_offset=$((90*24*60*60*1000)) # include migrations up to 90 days old
  included_migrations_timestamp=$(( $($date_command +%s) - included_date_offset / 1000 ))
  valid_migration_date=$(convert_timestamp_to_date "$included_migrations_timestamp")
 
  year=${migration_name:33:4}
  month=${migration_name:37:2}
  day=${migration_name:39:2}
  migration_timestamp=$($date_command -d "${year}-${month}-${day}" +%s)

  if (( $migration_timestamp < $included_migrations_timestamp )); then
    log_error "❌ New migration should be created after $valid_migration_date. Invalid migration name: '$migration_name'"
    exit 1
  fi
}

function validate_migrations(){
    local current_branch_name=$1
    local origin_branch_name=$2
    local migrations_dir="${ROOT}/packages/database/src/migrations"
    local new_migration_names_in_string=$(git diff --diff-filter=A --name-only $origin_branch_name $current_branch_name $migrations_dir)

    while read -r migration_name; do
      check_migration_outdated "$migration_name"
    done <<< "$new_migration_names_in_string"
}

current_branch_name=$(get_branch_name)
origin_branch_name="master"

git fetch
git checkout $origin_branch_name
git checkout $current_branch_name

validate_migrations $current_branch_name $origin_branch_name

log_success "✔ New migrations are valid!"
exit 0