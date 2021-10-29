FROM codeship/aws-deployment

COPY /tupaia/packages/devops/scripts/ci/triggerRedeploy.sh .
