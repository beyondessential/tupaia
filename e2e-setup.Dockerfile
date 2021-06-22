FROM alpine:3.14.0

RUN apk add --no-cache git openssh postgresql-client

WORKDIR /home

COPY ./e2e-setup.sh ./
RUN chmod +x ./e2e-setup.sh

COPY ./scripts ./scripts

COPY ./parallel_commands.sh /home/parallel_commands.sh
RUN chmod +x /home/parallel_commands.sh

COPY packages/data-api/scripts ./data-api-scripts

CMD sh /home/e2e-setup.sh