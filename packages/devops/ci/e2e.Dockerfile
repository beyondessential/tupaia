FROM cypress/base:14.19.0

RUN apk-add curl

WORKDIR /tupaia

# copy everything
COPY . ./

# install
RUN yarn install