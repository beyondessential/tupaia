# Fetch environment from LastPass and write to /env/<package>/.env
# Should be run by the tupaia ECS task prior to starting the service containers.
FROM alpine:3.17.3
RUN apk --no-cache add \
    bash \
    lastpass-cli
WORKDIR /lastpass/
COPY ./scripts/bash/getPackagesWithEnvFiles.sh ./scripts/bash/getDeployablePackages.sh ./scripts/bash/
COPY ./scripts/docker/downloadEnvironmentVariables.sh ./scripts/docker/
VOLUME /env
ENTRYPOINT ["./scripts/docker/downloadEnvironmentVariables.sh"]
CMD ["dev","/env"]

