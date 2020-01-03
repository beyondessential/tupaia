FROM node:10.18.0-alpine3.11

# install features not available in base alpine distro
RUN apk --no-cache add \
  bash \
  curl \
  openssh \
  postgresql-client

# get the package within the mono-repo that we are running CI/CD for out of build arguments
ARG package

# set the workdir so that all following commands run within /tupaia
WORKDIR /tupaia

# install dependencies via yarn, before copying the rest of the package, so that node_modules is
# built and added to the container cache without changes to code invalidating it
COPY package.json ./
COPY yarn.lock ./
RUN cat yarn.lock
RUN mkdir ./packages
RUN mkdir ./packages/${package}
RUN echo Copying packages/${package}/package.json
COPY packages/${package}/package.json ./packages/${packages}
RUN ls
RUN cd ./packages/${package} && ls
RUN cat ./packages/${packages}/package.json
RUN echo Is it there?
RUN yarn install

# copy everything else from the repo
COPY . ./

