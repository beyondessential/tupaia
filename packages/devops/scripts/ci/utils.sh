COLOR_RESET=0
COLOR_RED=31
COLOR_GREEN=32
COLOR_YELLOW=33

function ansi_color() {
    echo "\033[$1m"
}

function log_with_color() {
    echo -e "$(ansi_color $2)$1$(ansi_color $COLOR_RESET)"
}

function log_error() {
    log_with_color "$1" $COLOR_RED
}

function log_warn() {
    log_with_color "$1" $COLOR_YELLOW
}

function log_success() {
    log_with_color "$1" $COLOR_GREEN
}

function get_max_length() {
    array=($@)
    max=0

    for item in "${array[@]}"; do
        length=${#item}
        if [[ $length -gt $max ]]; then
            max=$length
        fi
    done

    echo $max
}

get_branch_name() {
    if [[ -n $CI_BRANCH ]]; then
        echo "$CI_BRANCH"
    else
        # Get currently checked out branch, or 'HEAD' if in detached head state
        git rev-parse --abbrev-ref HEAD
    fi
}
