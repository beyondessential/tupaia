FROM codeship/aws-deployment

COPY ./packages/devops/scripts/ci/triggerRedeploy.sh .
