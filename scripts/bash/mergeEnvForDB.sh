#!/bin/bash -e 
 

DIR=$(pwd "$0")

# Fixed paths to the .env files for the test db
file1="../../env/db.env"
file2="../../env/pg.env"
file3="../../env/data-lake.env"
file4="$DIR/.env"
 

# Load environment variables from .env files
merged_content="$(cat "$file1" "$file2" "$file3" "$file4")"

# Process command line arguments, overwriting values if present
for var in $(env); do
    if [[ "$var" == *=* ]]; then
        key="${var%%=*}"
        value="${var#*=}"
        # Override values from command line
        merged_content+=" $key=\"$value\""
    fi
done

# Evaluate merged content to set variables
eval "$merged_content" 

 

 
 




 
