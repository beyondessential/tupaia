FROM node:14.19.3-alpine3.15

# install features not available in base alpine distro
RUN apk --no-cache add \
  bash \
  git

# copy everything else from the repo
COPY . ./

# run yarn without building, so we can cache node_modules without code changes invalidating this layer
RUN SKIP_BUILD_INTERNAL_DEPENDENCIES=true yarn install --frozen-lockfile

#
RUN yarn workspace @tupaia/utils build