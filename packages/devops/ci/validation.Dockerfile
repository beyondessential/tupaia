FROM node:14.19.3-alpine3.15

# install features not available in base alpine distro
RUN apk --no-cache add \
  bash \
  git


# fix container not trusting GitHub
RUN mkdir -p ~/.ssh
RUN touch ~/.ssh/config
RUN chmod 700 ~/.ssh
RUN chmod 644 ~/.ssh/config
RUN echo -e "Host *\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config

# set Yarn v3
RUN yarn set version berry

# set the workdir so that all following commands run within /tupaia
WORKDIR /tupaia

# copy everything else from the repo
COPY . ./

# run yarn without building, so we can cache node_modules without code changes invalidating this layer
RUN SKIP_BUILD_INTERNAL_DEPENDENCIES=true yarn install --frozen-lockfile

#
RUN yarn workspace @tupaia/utils build