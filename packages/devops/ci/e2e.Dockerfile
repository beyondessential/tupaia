FROM cypress/base:14.19.0

WORKDIR /tupaia

# copy everything
COPY . ./

# install
RUN yarn install