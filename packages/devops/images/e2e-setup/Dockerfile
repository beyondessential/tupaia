FROM node:12.18.3-alpine3.11

RUN apk add --no-cache git openssh postgresql-client bash

WORKDIR /home

COPY packages/devops/images/e2e-setup/* ./

RUN mv data-api-env data-api/.env

COPY ./scripts ./scripts

CMD sh /home/e2e-setup.sh