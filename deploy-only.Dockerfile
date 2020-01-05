FROM alpine

# install features not available in base alpine distro
RUN apk --no-cache add \
  bash \
  curl \
  openssh

RUN mkdir -p ./packages/devops/scripts/ci
COPY packages/devops/scripts/ci/. ./packages/devops/scripts/ci
