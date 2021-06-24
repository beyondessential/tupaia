FROM mdillon/postgis:11-alpine

RUN apk add --no-cache bash

COPY packages/devops/images/postgres/postgres_healthcheck /bin/

RUN chmod +x /bin/postgres_healthcheck

HEALTHCHECK CMD ["postgres_healthcheck"]