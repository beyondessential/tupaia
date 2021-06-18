FROM mdillon/postgis:9.6-alpine

RUN apk add --no-cache bash

COPY docker-healthcheck /usr/local/bin/

HEALTHCHECK CMD ["docker-healthcheck"]