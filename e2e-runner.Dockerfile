FROM docker:latest

RUN apk add --no-cache git openssh docker-compose

WORKDIR /home

COPY ./Dockerfile ./
COPY ./docker-compose.yml ./
COPY ./e2e-config.env ./
COPY ./e2e-runner.sh ./
RUN chmod +x ./e2e-runner.sh
COPY ./scripts ./scripts
COPY ./ci-env-vars ./

RUN mkdir current
RUN mkdir reference

#COPY ./ current/
# (we checkout the reference branch at run time)

CMD sh /home/e2e-runner.sh