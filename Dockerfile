FROM node:12.18.3-alpine3.11

# install features not available in base alpine distro
RUN apk --no-cache add \
  bash \
  postgresql-client \
  git

# install pm2
RUN npm i --global pm2
RUN pm2 install pm2-logrotate

# set the workdir so that all following commands run within /tupaia
WORKDIR /tupaia

# get ready for dependencies to be installed via yarn, before copying the rest of the package, so
# that node_modules is built and added to the container cache without changes to code invalidating it
COPY package.json ./
COPY yarn.lock ./
COPY babel.config.json ./
COPY .babelrc-ts.js ./
RUN mkdir ./scripts
COPY scripts/. ./scripts

## copy just the package.json of each package so the monolith is ready for yarn install
RUN mkdir -p ./packages/access-policy
COPY packages/access-policy/. ./packages/access-policy
RUN mkdir -p ./packages/aggregator
COPY packages/aggregator/package.json ./packages/aggregator
RUN mkdir -p ./packages/auth
COPY packages/auth/. ./packages/auth
RUN mkdir -p ./packages/data-api
COPY packages/data-api/package.json ./packages/data-api
RUN mkdir -p ./packages/data-broker
COPY packages/data-broker/package.json ./packages/data-broker
RUN mkdir -p ./packages/database
COPY packages/database/package.json ./packages/database
RUN mkdir -p ./packages/devops
COPY packages/devops/package.json ./packages/devops
RUN mkdir -p ./packages/dhis-api
COPY packages/dhis-api/package.json ./packages/dhis-api
RUN mkdir -p ./packages/indicators
COPY packages/indicators/package.json ./packages/indicators
RUN mkdir -p ./packages/entity-server
COPY packages/entity-server/package.json ./packages/entity-server
RUN mkdir -p ./packages/lesmis-server
COPY packages/lesmis-server/package.json ./packages/lesmis-server
RUN mkdir -p ./packages/meditrak-server
COPY packages/meditrak-server/package.json ./packages/meditrak-server
RUN mkdir -p ./packages/psss-server
COPY packages/psss-server/package.json ./packages/psss-server
RUN mkdir -p ./packages/report-server
COPY packages/report-server/package.json ./packages/report-server
RUN mkdir -p ./packages/server-boilerplate
COPY packages/server-boilerplate/package.json ./packages/server-boilerplate
RUN mkdir -p ./packages/expression-parser
COPY packages/expression-parser/package.json ./packages/expression-parser
RUN mkdir -p ./packages/ui-components
COPY packages/ui-components/package.json ./packages/ui-components
RUN mkdir -p ./packages/utils
COPY packages/utils/package.json ./packages/utils
RUN mkdir -p ./packages/weather-api
COPY packages/weather-api/package.json ./packages/weather-api
RUN mkdir -p ./packages/web-config-server
COPY packages/web-config-server/package.json ./packages/web-config-server
RUN mkdir -p ./packages/web-frontend
COPY packages/web-frontend/package.json ./packages/web-frontend

## install monorepo dependencies, don't build anything
RUN SKIP_BUILD_INTERNAL_DEPENDENCIES=true yarn install

## add packages and build monorepo
COPY packages/. ./packages/
RUN chmod +x ./scripts/bash/build.sh
RUN sh scripts/bash/build.sh

# add container start scripts
COPY ./init-services.sh ./
RUN chmod +x ./init-services.sh

CMD ./init-services.sh && pm2 -f log
