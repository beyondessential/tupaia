#!/bin/bash

# Kill all pm2 processes
echo "Existing processes:"
pm2 list
echo "Deleting..."
pm2 delete all

# Set the branch to fetch and path of environment variables from parameter store
if [[ $STAGE == "production" ]];then
   BRANCH="master"
   ENVIRONMENT="production"
else
   BRANCH="$STAGE"
   ENVIRONMENT="$STAGE"
fi

# Get latest code and dependencies
echo "Checking out ${BRANCH}, or dev if that doesn't exist"
cd ${HOME_DIRECTORY}
git fetch
git checkout dev # Ensure we have dev as our default, if the specified branch doesn't exist
git checkout $BRANCH
git pull
yarn install

# For each package, get the latest and deploy it
for PACKAGE in "meditrak-server" "admin-panel" "web-frontend" "web-config-server"; do
    # Set up .env to match the environment variables stored in SSM parameter store
    cd ${HOME_DIRECTORY}/packages/$PACKAGE
    rm .env
    echo "Checking out ${ENVIRONMENT} environment variables for ${PACKAGE}"
    SSM_PATH="/${PACKAGE}/${ENVIRONMENT}"
    $(aws ssm get-parameters-by-path --with-decryption  --path $SSM_PATH \
    | jq -r '.Parameters| .[] | .Name + "=\"" + .Value + "\""  '  \
    | sed -e "s~${SSM_PATH}/~~" > .env)

    # If there were no environment variables for the specified branch, default to dev
    if [ ! -s .env ];then
      echo "Checking out default dev environment variables"
      SSM_PATH="/${PACKAGE}/dev"
      $(aws ssm get-parameters-by-path --with-decryption  --path $SSM_PATH \
      | jq -r '.Parameters| .[] | .Name + "=\"" + .Value + "\""  '  \
      | sed -e "s~${SSM_PATH}/~~" > .env)
      # Replace any instances of "dev" in the .env file (e.g. to point urls in the right place)
      sed -i -e "s/dev/${STAGE}/g" .env
    fi


    # If it's a server, start it running on pm2, otherwise build it
    echo "Preparing to start or build ${PACKAGE}"
    if [[ $PACKAGE == *server ]];then
      # It's a server, start the pm2 process
      echo "Starting ${PACKAGE}"
      yarn build
      pm2 start --name $PACKAGE dist --wait-ready --listen-timeout 15000
    else
      # It's a static site, build it
      echo "Building ${PACKAGE}"
      yarn build
    fi
done

	
echo "Migrating the database"
yarn migrate

echo "Finished deploying latest"