FROM amazon/aws-cli

COPY ./packages/devops/scripts/ci/triggerRedeploy.sh .

RUN curl -L https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 > jq
RUN chmod +x jq
RUN mv jq /bin

ENTRYPOINT [ "" ]
