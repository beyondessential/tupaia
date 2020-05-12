/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
const sleep = (delay = 0) => {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
};

export const FakeStore = {
  auth: {
    status: 'idle',
    error: null,
    user: null,
    authenticate(credentials) {
      console.log('credentials', credentials);
      return new Promise(async resolve => {
        await sleep(1000);
        // FakeStore.auth.status = 'error';
        FakeStore.auth.status = 'success';
        FakeStore.auth.error = 'Woops! There was an error with the api';
        FakeStore.auth.user = {
          name: 'Kupe',
        };
        resolve(FakeStore.auth);
      });
    },
    logout() {
      return new Promise(async resolve => {
        await sleep(1000);
        FakeStore.auth.user = null;
        resolve();
      });
    },
  },
};
