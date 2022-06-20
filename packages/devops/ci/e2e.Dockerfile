FROM cypress/base:14.17.6

# set Yarn v3
RUN yarn set version berry

WORKDIR /tupaia

COPY package.json ./
COPY yarn.lock ./
COPY babel.config.json ./

# Copy the packages needed by cypress in web-frontend
RUN mkdir -p ./packages/access-policy
COPY packages/access-policy/package.json ./packages/access-policy
RUN mkdir -p ./packages/auth
COPY packages/auth/package.json ./packages/auth
RUN mkdir -p ./packages/database
COPY packages/database/package.json ./packages/database
RUN mkdir -p ./packages/devops
COPY packages/devops/package.json ./packages/devops
RUN mkdir -p ./packages/web-frontend
COPY packages/web-frontend/package.json ./packages/web-frontend
RUN mkdir -p ./packages/ui-components
COPY packages/ui-components/package.json ./packages/ui-components
RUN mkdir -p ./packages/utils
COPY packages/utils/package.json ./packages/utils

RUN SKIP_BUILD_INTERNAL_DEPENDENCIES=true yarn install

# Copy TS config used in internal dependencies
COPY tsconfig-js.json ./

COPY packages/access-policy/. ./packages/access-policy
COPY packages/auth/. ./packages/auth
COPY packages/database/. ./packages/database
COPY packages/devops/. ./packages/devops
COPY packages/web-frontend/. ./packages/web-frontend
COPY packages/ui-components/. ./packages/ui-components
COPY packages/utils/. ./packages/utils

## Build internal dependencies
RUN yarn workspace @tupaia/access-policy build
RUN yarn workspace @tupaia/auth build
RUN yarn workspace @tupaia/database build
RUN yarn workspace @tupaia/ui-components build
RUN yarn workspace @tupaia/utils build
