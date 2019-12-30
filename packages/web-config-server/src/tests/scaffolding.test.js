/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiLike from 'chai-like';
import sinonChai from 'sinon-chai';

// These setup tasks need to be performed before any test, so we
// do them in this file outside of any describe block.

before(() => {
  chai.use(chaiLike);
  chai.use(sinonChai);

  // `chaiAsPromised` must be used after other plugins to promisify them
  chai.use(chaiAsPromised);
});
