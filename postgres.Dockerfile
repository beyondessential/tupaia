FROM mdillon/postgis:9.6-alpine

RUN apk add --no-cache bash

COPY postgres_healthcheck /bin/

RUN chmod +x /bin/postgres_healthcheck

HEALTHCHECK CMD ["postgres_healthcheck"]