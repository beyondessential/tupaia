import faker from 'faker';

export const FakeAPI = {
  sleep(delay = 0) {
    return new Promise(resolve => {
      setTimeout(resolve, delay);
    });
  },

  async post() {
    await this.sleep(2000);

    return {
      status: 'success',
    };
  },

  async get(endpoint, options) {
    const data = [];

    // Create users
    if (endpoint === 'users') {
      for (let i = 0; i < 30; i++) {
        data.push(this.user());
      }
    } else if (endpoint === 'countries') {
      options.countries.forEach(countryCode => {
        data.push(this.country(countryCode));
      });
    } else if (endpoint === 'country-weeks') {
      for (let i = 0; i < 10; i++) {
        data.push(this.countryWeek(i));
      }
    } else if (endpoint === 'sites') {
      // for (let i = 0; i < 7; i++) {
      //   data.push(this.siteWeek());
      // }
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
    } else if (endpoint === 'activity-feed') {
      for (let i = 0; i < 3; i++) {
        data.push(this.activity());
      }
    } else if (endpoint === 'affected-sites') {
      for (let i = 0; i < 8; i++) {
        data.push(this.affectedSite());
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

    return {
      data,
      count: data.length,
    };
  },

  makeSyndrome(code, name) {
    const percentageChange = faker.random.number({
      min: -15,
      max: 15,
    });

    return {
      id: code,
      title: name,
      percentageChange,
      totalCases: faker.random.number({
        min: 0,
        max: 1000,
      }),
      isAlert: percentageChange > 5,
    };
  },

  syndromes() {
    return [
      this.makeSyndrome('afr', 'Acute Fever and Rash (AFR)'),
      this.makeSyndrome('dia', 'Diarrhoea (DIA)'),
      this.makeSyndrome('ili', 'Influenza-like Illness (ILI)'),
      this.makeSyndrome('pf', 'Prolonged Fever (PF)'),
      this.makeSyndrome('dli', 'Dengue-like Illness (DLI)'),
    ];
  },

  affectedSite() {
    const countryWeek = this.countryWeek(0);
    const sites = [];
    for (let i = 0; i < 5; i++) {
      sites.push(this.siteWeek());
    }
    return {
      ...countryWeek,
      status: faker.random.arrayElement(['alert', 'outbreak']),
      sites,
    };
  },

  countryWeek(index) {
    return {
      id: faker.random.uuid(),
      index,
      weekNumber: faker.random.number({
        min: 1,
        max: 10,
      }),
      startDate: faker.date.between('2020-01-01', '2020-01-31'),
      endDate: faker.date.between('2020-02-01', '2020-02-28'),
      sitesReported: faker.random.number({
        min: 0,
        max: 30,
      }),
      totalSites: 30,
      totalCases: faker.random.number({
        min: 1000,
        max: 2000,
      }),
      percentageChange: faker.random.number({
        min: -15,
        max: 15,
      }),
      syndromes: this.syndromes(),
      status: faker.random.arrayElement(['Submitted', 'Overdue']),
    };
  },

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
  },

  update() {
    const user = this.user();
    return {
      id: faker.random.uuid(),
      user,
      type: faker.random.arrayElement(['note', 'statusChange']),
      dateTime: faker.date.between('2020-01-01', '2020-04-31'),
    };
  },

  activity() {
    const update1 = this.update();
    const update2 = this.update();
    return {
      id: faker.random.uuid(),
      weekNumber: faker.random.number({
        min: 1,
        max: 10,
      }),
      dateTime: faker.date.between('2020-04-01', '2020-04-31'),
      updates: [update1, update2],
    };
  },

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
  },

  alert() {
    const weekNumber = faker.random.number({
      min: 10,
      max: 50,
    });
    return {
      id: faker.random.uuid(),
      name: faker.address.country(),
      countryCode: faker.address.countryCode(),
      syndrome: faker.random.arrayElement(['AFR', 'DIA', 'ILI', 'PF', 'DLI']),
      syndromeName: faker.random.arrayElement([
        'Acute Fever and Rash (AFR)',
        'Diarrhoea (DIA)',
        'Influenza-like Illness (ILI)',
        'Prolonged Fever (PF)',
        'Dengue-like Illness (DLI)',
      ]),
      weekNumber,
      period: `2020W${weekNumber}`,
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
  },

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
  },

  user() {
    return {
      id: faker.random.uuid(),
      avatar: faker.internet.avatar(),
      name: faker.name.firstName(),
      surname: faker.name.lastName(),
      email: faker.internet.email(),
      city: faker.address.city(),
    };
  },
};
