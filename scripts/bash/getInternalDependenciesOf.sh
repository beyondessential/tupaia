#!/usr/bin/env bash
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
. "$script_dir/ansiControlSequences.sh"

print_help_message() {
	echo todo
}

if (($# == 0)); then
  print_help_message
  exit 2
fi

declare -i exclude_self=0
declare -i glob=0
while [ "$1" != "" ]; do
  case $1 in
  --)
    shift
    break
    ;;
  -h | --help)
    print_help_message
    exit
    ;;
  -g | --as-glob)
    shift
    glob=1
    ;;
  -x | --exclude-self)
    shift
    exclude_self=1
    ;;
	*)
		break
  esac
done

package_name=$1

declare -a all_deps
readarray -t all_deps < <(
  yarn workspace "$package_name" info \
    --json \
    --manifest \
    --name-only
)

declare -a internal_deps
internal_deps=()
for dep in "${all_deps[@]}"; do
  if [[ $dep = \"@tupaia/* ]]; then
		if ((exclude_self==1)) && [[ $dep = \""$package_name"* ]]; then
			continue # `yarn workspace info` lists the queried package
		fi
		#                          Yarn output                   → '"@tupaia/foo@workspace:packages/foo"'
    dep="${dep#\"@tupaia/}"  # Trim leading quote & scope    → 'foo@workspace:packages/foo"'
    dep="${dep%@*\"}"        # Trim trailing quote & version → 'foo'
    internal_deps+=("$dep")
  fi
done

if ((glob==1)); then
	# ('foo' 'bar' 'baz') → 'foo,bar,baz'
	pattern=$(
		IFS=,
		echo "${internal_deps[*]}"
	)
	# 'foo,bar,baz' → '{foo,bar,baz}'
	echo "{$pattern}"
else
	printf '%s\n' "${internal_deps[@]}"
fi

exit 0
