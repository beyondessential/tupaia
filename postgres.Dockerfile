FROM mdillon/postgis:9.6-alpine

RUN apk add --no-cache bash

COPY docker-healthcheck /bin/

HEALTHCHECK CMD ["docker-healthcheck"]