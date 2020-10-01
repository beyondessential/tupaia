ANSI_COLOR_GREEN="\e[32m"
ANSI_COLOR_RED="\e[31m"
ANSI_COLOR_RESET="\e[0m"

function log_with_color() {
  text=$1
  color=$2
  echo -e "$2$1$ANSI_COLOR_RESET"
}

function log_error() {
  log_with_color "$1" $ANSI_COLOR_RED
}

function log_success() {
  log_with_color "$1" $ANSI_COLOR_GREEN
}