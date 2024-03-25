#!/bin/bash -e 

# Fixed paths to the .env files for the test db
file1="../../env/.env.db"
file2="../../env/.env.pg"
file3="../../env/.env.dataLake"
file4=".env"

# Merge files and assign to a variable
new_env=$(cat "$file1" "$file2" "$file3" "$file4")

# Eval the merged content
eval "$new_env"
