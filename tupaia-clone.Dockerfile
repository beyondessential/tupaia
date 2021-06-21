FROM alpine:3.14.0

RUN apk add --no-cache git openssh

WORKDIR /home

COPY ./tupaia-clone.sh ./
RUN chmod +x ./tupaia-clone.sh

CMD sh /home/tupaia-clone.sh