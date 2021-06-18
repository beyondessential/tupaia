FROM docker:latest

RUN apk add --no-cache git openssh

WORKDIR /home

COPY ./Dockerfile ./
COPY ./e2e-docker-compose.yml ./
COPY ./e2e-runner.sh ./
RUN chmod +x ./e2e-runner.sh
COPY ./scripts ./scripts

RUN mkdir current
RUN mkdir reference

#COPY ./ current/
# (we checkout the reference branch at run time)

CMD sh /home/e2e-runner.sh