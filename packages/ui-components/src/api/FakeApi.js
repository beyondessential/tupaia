/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import faker from 'faker';

export class FakeAPI {
  // eslint-disable-next-line class-methods-use-this
  sleep(delay = 0) {
    return new Promise(resolve => {
      setTimeout(resolve, delay);
    });
  }

  async get() {
    const data = [];

    // Create users
    for (let i = 0; i < 30; i++) {
      const userData = this.user();
      data.push(userData);
    }

    await this.sleep(500);

    console.log('DATA', data);

    return {
      data,
      count: data.length,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  user() {
    return {
      name: faker.name.firstName(),
      surname: faker.name.lastName(),
      email: faker.internet.email(),
      city: faker.address.city(),
    };
  }
}
