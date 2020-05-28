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

  async get(endpoint, options) {
    // console.log('OPTIONS', options);
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
        const userData = this.countryWeek(i);
        data.push(userData);
      }
    } else if (endpoint === 'sites') {
      for (let i = 0; i < 7; i++) {
        const userData = this.siteWeek();
        data.push(userData);
      }
    }

    await this.sleep(500);

    // console.log('DATA', data);

    return {
      data,
      count: data.length,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  indicators() {
    return [
      {
        id: 'afr',
        title: 'Acute Fever and Rash (AFR)',
        percentageChange: faker.random.number({
          min: -15,
          max: 15,
        }),
        totalCases: faker.random.number({
          min: 0,
          max: 1000,
        }),
      },
      {
        id: 'dia',
        title: 'Diarrhoea (DIA)',
        percentageChange: faker.random.number({
          min: -15,
          max: 15,
        }),
        totalCases: faker.random.number({
          min: 0,
          max: 1000,
        }),
      },
      {
        id: 'ili',
        title: 'Influenza-like Illness (ILI)',
        percentageChange: faker.random.number({
          min: -15,
          max: 15,
        }),
        totalCases: faker.random.number({
          min: 0,
          max: 1000,
        }),
      },
      {
        id: 'pf',
        title: 'Prolonged Fever (AFR)',
        percentageChange: faker.random.number({
          min: -15,
          max: 15,
        }),
        totalCases: faker.random.number({
          min: 0,
          max: 1000,
        }),
      },
      {
        id: 'dil',
        title: 'Dengue-like Illness (DIL)',
        percentageChange: faker.random.number({
          min: -15,
          max: 15,
        }),
        totalCases: faker.random.number({
          min: 0,
          max: 1000,
        }),
      },
    ];
  }

  // eslint-disable-next-line class-methods-use-this
  countryWeek(index) {
    return {
      id: faker.random.uuid(),
      index: index,
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
      indicators: this.indicators(),
      status: faker.random.arrayElement(['Submitted', 'Overdue']),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  siteWeek() {
    const city = faker.address.city();
    return {
      id: faker.random.uuid(),
      name: city,
      sitesReported: faker.random.number({
        min: 0,
        max: 30,
      }),
      address: {
        name: `${city} Health Clinic`,
        district: `${city} District 96799`,
        country: faker.address.country(),
      },
      contact: {
        name: faker.name.findName(),
        department: faker.name.jobTitle(),
        email: faker.internet.email(),
      },
      indicators: this.indicators(),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  country() {
    return {
      id: faker.random.uuid(),
      name: faker.address.country(),
      sitesReported: faker.random.number({
        min: 0,
        max: 30,
      }),
      indicators: this.indicators(),
    };
  }

  // eslint-disable-next-line class-methods-use-this
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
