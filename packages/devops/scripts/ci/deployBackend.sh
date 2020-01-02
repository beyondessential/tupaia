if [[ $CI_BRANCH == "master" ]];then
   DEPLOYMENT_URL="tupaia.org"
else
   DEPLOYMENT_URL="${CI_BRANCH}.tupaia.org"
fi

if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
  echo "Deployment for ${CI_BRANCH} exists, updating with latest changes"
  ssh ubuntu@api.tupaia.org 'cd ${CI_PACKAGE}; git fetch; git checkout ${CI_BRANCH}; git pull; yarn; yarn migrate; pm2 restart ${CI_PACKAGE};'
else
  echo "No deployment exists for ${CI_BRANCH}, cancelling update"
fi
