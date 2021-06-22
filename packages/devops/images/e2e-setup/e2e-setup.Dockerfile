FROM alpine:3.14.0

RUN apk add --no-cache git openssh postgresql-client bash

WORKDIR /home

COPY packages/devops/images/e2e-setup/* ./

COPY ./scripts ./scripts

COPY packages/data-api/scripts ./data-api-scripts

CMD sh /home/e2e-setup.sh