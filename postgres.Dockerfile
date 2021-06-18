FROM mdillon/postgis:9.6-alpine

RUN apk add --no-cache bash

COPY postgres_healthcheck /bin/

HEALTHCHECK CMD ["postgres_healthcheck"]