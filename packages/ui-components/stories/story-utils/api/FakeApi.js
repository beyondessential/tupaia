import faker from 'faker';

export class FakeAPI {
  sleep(delay = 0) {
    return new Promise(resolve => {
      setTimeout(resolve, delay);
    });
  }

  async post() {
    await this.sleep(2000);

    return {
      status: 'success',
    };
  }

  async get(endpoint, options) {
    const data = [];

    // Create users
    if (endpoint === 'users') {
      for (let i = 0; i < 30; i++) {
        const userData = this.user();
        data.push(userData);
      }
    } else if (endpoint === 'countries') {
      for (let i = 0; i < 20; i++) {
        const userData = this.country();
        data.push(userData);
      }
    } else if (endpoint === 'country-weeks') {
      for (let i = 0; i < 10; i++) {
        const userData = this.countryWeek();
        data.push(userData);
      }
    } else if (endpoint === 'sites') {
      for (let i = 0; i < 7; i++) {
        const userData = this.siteWeek();
        data.push(userData);
      }
    }

    await this.sleep(500);

    return {
      data,
      count: data.length,
    };
  }

  countryWeek() {
    return {
      id: faker.random.uuid(),
      week: faker.random.number({
        min: 1,
        max: 10,
      }),
      startDate: faker.date.between('2020-01-01', '2020-01-31'),
      endDate: faker.date.between('2020-02-01', '2020-02-28'),
      sitesReported: faker.random.number({
        min: 0,
        max: 30,
      }),
      AFR: faker.random.number({
        min: 0,
        max: 1000,
      }),
      DIA: faker.random.number({
        min: 0,
        max: 1000,
      }),
      ILI: faker.random.number({
        min: 0,
        max: 1000,
      }),
      PF: faker.random.number({
        min: 0,
        max: 1000,
      }),
      DLI: faker.random.number({
        min: 0,
        max: 1000,
      }),
      status: faker.random.arrayElement(['Submitted', 'Overdue']),
    };
  }

  siteWeek() {
    return {
      id: faker.random.uuid(),
      name: faker.address.city(),
      sitesReported: faker.random.number({
        min: 0,
        max: 30,
      }),
      AFR: faker.random.number({
        min: 0,
        max: 1000,
      }),
      DIA: faker.random.number({
        min: 0,
        max: 1000,
      }),
      ILI: faker.random.number({
        min: 0,
        max: 1000,
      }),
      PF: faker.random.number({
        min: 0,
        max: 1000,
      }),
      DLI: faker.random.number({
        min: 0,
        max: 1000,
      }),
    };
  }

  country() {
    return {
      id: faker.random.uuid(),
      name: faker.address.country(),
      sitesReported: faker.random.number({
        min: 0,
        max: 30,
      }),
      AFR: faker.random.number({
        min: 0,
        max: 1000,
      }),
      DIA: faker.random.number({
        min: 0,
        max: 1000,
      }),
      ILI: faker.random.number({
        min: 0,
        max: 1000,
      }),
      PF: faker.random.number({
        min: 0,
        max: 1000,
      }),
      DLI: faker.random.number({
        min: 0,
        max: 1000,
      }),
    };
  }

  user() {
    return {
      id: faker.random.uuid(),
      name: faker.name.firstName(),
      surname: faker.name.lastName(),
      email: faker.internet.email(),
      city: faker.address.city(),
    };
  }
}
