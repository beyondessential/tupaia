FROM node:12.18.3-alpine3.11

RUN apk --no-cache add bash lastpass-cli

WORKDIR /tupaia

RUN mkdir ./scripts
COPY scripts/. ./scripts

RUN mkdir -p ./packages/devops/scripts/ci
COPY packages/devops/scripts/ci/. ./packages/devops/scripts/ci