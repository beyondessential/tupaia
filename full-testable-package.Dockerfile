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
# dependencies must exist during yarn install (currently just 'database')
RUN mkdir -p ./packages/database
COPY packages/database/. ./packages/database

# install internal and external dependencies
RUN yarn install

# copy everything else from the repo
COPY . ./

