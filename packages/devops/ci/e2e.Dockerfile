FROM cypress/base:12.18.3

WORKDIR /tupaia

COPY package.json ./
COPY yarn.lock ./
COPY babel.config.json ./
COPY .babelrc-ts.js ./

# Copy the packages needed by cypress in web-frontend
RUN mkdir -p ./packages/web-frontend
COPY packages/web-frontend/package.json ./packages/web-frontend
RUN mkdir -p ./packages/ui-components
COPY packages/ui-components/package.json ./packages/ui-components
RUN mkdir -p ./packages/utils
COPY packages/utils/package.json ./packages/utils

RUN SKIP_BUILD_INTERNAL_DEPENDENCIES=true yarn install

# Copy TS config used in internal dependencies
COPY tsconfig-js.json ./

COPY packages/devops/. ./packages/devops
COPY packages/web-frontend/. ./packages/web-frontend
COPY packages/ui-components/. ./packages/ui-components

COPY packages/utils/. ./packages/utils

## Build internal dependencies
RUN yarn workspace @tupaia/utils build
