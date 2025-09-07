#!/usr/bin/env bash

set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
. "$script_dir"/utils.sh

INVALID_CHARS=('/' '\' '.' '&' '?' '_')

SUBDOMAIN_SUFFIXES=(
    admin
    admin-api
    aggregation
    api
    config
    data-table-api
    datatrak
    datatrak-web-api
    db
    entity
    entity-api
    export
    lesmis
    lesmis-api
    meditrak-api
    mobile
    psss
    psss-api
    report
    report-api
    ssh
    sync-api
    tonga-aggregation
    tupaia-web-api
    www
)

get_max_length() {
    local -i max=0
    for item in "$@"; do
        length=${#item}
        if ((length > $max)); then
            max=$length
        fi
    done
    echo "$max"
}

# Branch names are often reused as deployment names for AWS EC2 deployments. Deployment names are
# combined with standard suffixes to create deployment urls, eg {{deploymentName}}-tonga-aggregation.tupaia.org
MAX_SUBDOMAIN_LENGTH=64
MAX_SUBDOMAIN_SUFFIX_LENGTH=$(get_max_length "${SUBDOMAIN_SUFFIXES[@]}")
MAX_BRANCH_NAME_LENGTH=$((MAX_SUBDOMAIN_LENGTH - ${MAX_SUBDOMAIN_SUFFIX_LENGTH} - 1)) # Subtract 1 for the connecting `-`
# As of 11/08/21, MAX_BRANCH_NAME_LENGTH = 64 - 17 - 1 = 46 (Longest subdomain "tonga-aggregation")

DEPLOYMENT_WARNING_PREFIX="This branch name can't be used as a deployment name because"

warnings=()

add_warning() {
    warnings+=("$DEPLOYMENT_WARNING_PREFIX $1")
}

validate_name_ending() {
    local branch_name=$1

    for suffix in ${SUBDOMAIN_SUFFIXES[@]}; do
        if [[ "$branch_name" == *$suffix ]]; then
            add_warning "it ends in '$suffix', which is a reserved subdomain suffix"
            return
        fi
        # api is one of our suffixes so makes sure [branch]-api doesn't match any other api suffixes
        if [[ "$suffix" == *-api && $branch_name-api == *$suffix ]]; then
            add_warning "it would clash with the reserved subdomain suffix '$suffix'"
            return
        fi
    done
}

validate_name_length() {
    local branch_name=$1
    local name_length=${#branch_name}

    if [[ $name_length -gt MAX_BRANCH_NAME_LENGTH ]]; then
        add_warning "it is $name_length characters long; the maximum is $MAX_BRANCH_NAME_LENGTH so that deployment subdomains stay within $MAX_SUBDOMAIN_LENGTH characters"
    fi
}

validate_name_chars() {
    local branch_name=$1

    if [[ $branch_name =~ [A-Z] ]]; then
        add_warning "it contains uppercase characters, which aren't allowed in subdomains"
    fi

    for character in "${INVALID_CHARS[@]}"; do
        if [[ "$branch_name" == *"$character"* ]]; then
            add_warning "it contains '$character', which isn't allowed in subdomains"
        fi
    done
}

branch_name=$(get_branch_name)

# Workhorse controls the names of its branches (workhorse/<card-code>), so they're exempt from these
# checks. To deploy one, pass a separate DeploymentName, eg "workhorse-e1" for branch "workhorse/e1"
if [[ "$branch_name" == workhorse/* ]]; then
    log_success "✔ Workhorse branch, skipping branch name validation"
    exit 0
fi

validate_name_ending "$branch_name"
validate_name_length "$branch_name"
validate_name_chars "$branch_name"

if [[ ${#warnings[@]} -eq 0 ]]; then
    log_success "✔ Branch name is valid!"
    exit 0
fi

# A branch with an invalid name can still be deployed under a different deployment name, so report
# problems without failing the build
for warning in "${warnings[@]}"; do
    log_warn "⚠ $warning"
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        echo "::warning::$warning"
    fi
done
log_warn "To deploy it, choose a different DeploymentName when spinning up the deployment"
exit 0
