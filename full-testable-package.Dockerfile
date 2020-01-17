FROM node:10.18.0-alpine3.11

# install features not available in base alpine distro
RUN apk --no-cache add \
  bash \
  postgresql-client

# get the package within the mono-repo that we are running CI/CD for out of build arguments
ARG package

# set the workdir so that all following commands run within /tupaia
WORKDIR /tupaia

# get ready for dependencies to be isntalled via yarn, before copying the rest of the package, so
# that node_modules is built and added to the container cache without changes to code invalidating it
COPY package.json ./
COPY yarn.lock ./
RUN mkdir -p ./packages/${package}
COPY packages/${package}/package.json ./packages/${package}

# some packages also have internal dependencies loaded by yarn workspaces, so these internal
# dependencies must exist during yarn install (e.g. database, dhis-api)
RUN mkdir -p ./packages/aggregator
COPY packages/aggregator/. ./packages/aggregator
RUN mkdir -p ./packages/data-broker
COPY packages/data-broker/. ./packages/data-broker
RUN mkdir -p ./packages/devops
COPY packages/devops/. ./packages/devops
RUN mkdir -p ./packages/database
COPY packages/database/. ./packages/database
RUN mkdir -p ./packages/dhis-api
COPY packages/dhis-api/. ./packages/dhis-api
RUN mkdir -p ./packages/utils
COPY packages/utils/. ./packages/utils

# install internal and external dependencies (preinstall will build internal)
RUN yarn install

# copy everything else from the repo
COPY . ./

