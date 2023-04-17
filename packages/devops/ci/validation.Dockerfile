FROM node:14.19.3-alpine3.15

# install features not available in base alpine distro
RUN apk --no-cache add \
  bash \
  git

# set Yarn v3
RUN yarn set version berry

# set the workdir so that all following commands run within /tupaia
WORKDIR /tupaia

# copy everything else from the repo
COPY . ./

# run yarn without building, so we can cache node_modules without code changes invalidating this layer
RUN SKIP_BUILD_INTERNAL_DEPENDENCIES=true yarn install --frozen-lockfile

# /scripts/node/validateTests.js use utils package
RUN yarn workspace @tupaia/utils build