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

# For each repository, get the latest and deploy it
for REPOSITORY_NAME in "meditrak-server" "tupaia-admin" "tupaia-web" "tupaia-config-server"; do
    echo "Deploying ${REPOSITORY_NAME} (${ENVIRONMENT}, or dev if that doesn't exist)"
    # Get latest code and dependencies
    cd ${HOME_DIRECTORY}/$REPOSITORY_NAME
    git fetch
    git checkout dev # Ensure we have dev as our default, if the specified branch doesn't exist
    git checkout $BRANCH
    git pull
    yarn install

    # Set up .env to match the environment variables stored in SSM parameter store
    cd ${HOME_DIRECTORY}/$REPOSITORY_NAME
    rm .env
    echo "Checking out ${ENVIRONMENT} environment variables for ${REPOSITORY_NAME}"
    SSM_PATH="/${REPOSITORY_NAME}/${ENVIRONMENT}"
    $(aws ssm get-parameters-by-path --with-decryption  --path $SSM_PATH \
    | jq -r '.Parameters| .[] | .Name + "=\"" + .Value + "\""  '  \
    | sed -e "s~${SSM_PATH}/~~" > .env)

    # If there were no environment variables for the specified branch, default to dev
    if [ ! -s .env ];then
      echo "Checking out default dev environment variables"
      SSM_PATH="/${REPOSITORY_NAME}/dev"
      $(aws ssm get-parameters-by-path --with-decryption  --path $SSM_PATH \
      | jq -r '.Parameters| .[] | .Name + "=\"" + .Value + "\""  '  \
      | sed -e "s~${SSM_PATH}/~~" > .env)
      # Replace any instances of "dev" in the .env file (e.g. to point urls in the right place)
      sed -i -e "s/dev/${STAGE}/g" .env
    fi


    # If it's a server, start it running on pm2, otherwise build it
    echo "Preparing to start or build ${REPOSITORY_NAME}"
    if [[ $REPOSITORY_NAME == *server ]];then
      # It's a server, migrate the database then start the pm2 process
      echo "Migrating database and starting ${REPOSITORY_NAME}"
      yarn migrate
      pm2 start --name $REPOSITORY_NAME "yarn start"
    else
      # It's a static site, build it
      echo "Building ${REPOSITORY_NAME}"
      yarn build
    fi
done
