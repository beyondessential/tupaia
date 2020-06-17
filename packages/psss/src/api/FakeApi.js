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
        data.push(this.user());
      }
    } else if (endpoint === 'countries') {
      for (let i = 0; i < 20; i++) {
        data.push(this.country());
      }
    } else if (endpoint === 'country-weeks') {
      for (let i = 0; i < 10; i++) {
        data.push(this.countryWeek(i));
      }
    } else if (endpoint === 'sites') {
      for (let i = 0; i < 7; i++) {
        data.push(this.siteWeek());
      }
    } else if (endpoint === 'alerts') {
      for (let i = 0; i < 10; i++) {
        data.push(this.alert());
      }
    } else if (endpoint === 'outbreaks') {
      for (let i = 0; i < 3; i++) {
        data.push(this.outbreak());
      }
    } else if (endpoint === 'messages') {
      for (let i = 0; i < 3; i++) {
        data.push(this.message());
      }
    } else if (endpoint === 'archive') {
      for (let i = 0; i < 5; i++) {
        data.push(this.alert());
      }
      for (let j = 0; j < 5; j++) {
        data.push(this.outbreak());
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
  syndromes() {
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
      index,
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
      syndromes: this.syndromes(),
      status: faker.random.arrayElement(['Submitted', 'Overdue']),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  message() {
    const user = this.user();
    return {
      user,
      message: {
        id: faker.random.uuid(),
        created: faker.date.between('2020-04-01', '2020-04-31'),
        lastUpdated: faker.date.between('2020-05-01', '2020-05-31'),
        content: faker.lorem.sentences(),
      },
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
      syndromes: this.syndromes(),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  country() {
    return {
      id: faker.random.uuid(),
      name: faker.address.country(),
      countryCode: faker.address.countryCode().toLowerCase(),
      sitesReported: faker.random.number({
        min: 0,
        max: 30,
      }),
      syndromes: this.syndromes(),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  alert() {
    return {
      id: faker.random.uuid(),
      name: faker.address.country(),
      countryCode: faker.address.countryCode().toLowerCase(),
      syndrome: faker.random.arrayElement(['AFR', 'DIA', 'ILI', 'PF', 'DIL']),
      week: faker.random.number({
        min: 1,
        max: 10,
      }),
      startDate: faker.date.between('2020-01-01', '2020-01-31'),
      endDate: faker.date.between('2020-02-01', '2020-02-28'),
      totalCases: faker.random.number({
        min: 10000,
        max: 20000,
      }),
      sitesReported: faker.random.number({
        min: 40,
        max: 100,
      }),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  outbreak() {
    const alert = this.alert();
    return {
      ...alert,
      diagnosis: faker.random.arrayElement(['Measles', 'Influenza']),
      outbreakStartDate: faker.date.between('2020-01-01', '2020-01-31'),
      totalLabCases: faker.random.number({
        min: 100,
        max: 300,
      }),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  user() {
    return {
      id: faker.random.uuid(),
      avatar: faker.internet.avatar(),
      name: faker.name.firstName(),
      surname: faker.name.lastName(),
      email: faker.internet.email(),
      city: faker.address.city(),
    };
  }
}
