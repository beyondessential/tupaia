FROM amazon/aws-cli

COPY ./packages/devops/scripts/ci/triggerRedeploy.sh .

ENTRYPOINT [ "" ]
