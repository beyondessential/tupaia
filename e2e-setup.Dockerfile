FROM alpine:3.14.0

RUN apk add --no-cache git openssh postgresql-client

WORKDIR /home

COPY ./e2e-setup.sh ./
RUN chmod +x ./e2e-setup.sh

COPY ./scripts ./scripts

# This service announces it is healthy when the setup script finishes and creates a file called DONE
HEALTHCHECK CMD ["test -f DONE"]

CMD sh /home/e2e-setup.sh && tail -f /dev/null