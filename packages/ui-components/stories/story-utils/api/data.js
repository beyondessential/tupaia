import faker from 'faker';

const id = faker.random.uuid;

export const ENTITIES = [
  // projects
  { id: id(), code: 'covidau', name: 'COVID-19 Australia' },
  {
    id: id(),
    code: 'europe',
    name: 'European Project',
  },
  { id: id(), code: 'empty', name: 'Empty hierarchy' },

  // Australia
  { id: id(), code: 'AU', name: 'Australia' },
  { id: id(), code: 'AU_New_South_Wales', name: 'New South Wales' },
  { id: id(), code: 'AU_New_South_Wales_Albury', name: 'Albury' },
  { id: id(), code: 'AU_New_South_Wales_Byron', name: 'Byron' },
  { id: id(), code: 'AU_New_South_Wales_Sydney', name: 'Sydney' },
  { id: id(), code: 'AU_Queensland', name: 'Queensland' },
  { id: id(), code: 'AU_Queensland_Brisbane', name: 'Brisbane' },
  { id: id(), code: 'AU_Queensland_Cairns', name: 'Cairns' },
  { id: id(), code: 'AU_Tasmania', name: 'Tasmania' },
  { id: id(), code: 'AU_Victoria', name: 'Victoria' },
  { id: id(), code: 'AU_Victoria_Ballarat', name: 'Ballarat' },
  { id: id(), code: 'AU_Victoria_Melbourne', name: 'Melbourne' },
  { id: id(), code: 'AU_Western_Australia', name: 'Western Australia' },

  // Austria
  { id: id(), code: 'AT', name: 'Austria' },
  { id: id(), code: 'AT_Vienna', name: 'Vienna' },

  // Czech Republic
  { id: id(), code: 'CZ', name: 'Czech Republic' },
  { id: id(), code: 'CZ_Prague', name: 'Prague' },

  // Denmark
  { id: id(), code: 'DK', name: 'Denmark' },
  { id: id(), code: 'DK_Copenhagen', name: 'Copenhagen' },

  // France
  { id: id(), code: 'FR', name: 'France' },
  { id: id(), code: 'FR_Lyon', name: 'Lyon' },
  { id: id(), code: 'FR_Nice', name: 'Nice' },
  { id: id(), code: 'FR_Paris', name: 'Paris' },

  // Germany
  { id: id(), code: 'DE', name: 'Germany' },
  { id: id(), code: 'DE_Berlin', name: 'Berlin' },
  { id: id(), code: 'DE_Frankfurt', name: 'Frankfurt' },
  { id: id(), code: 'DE_Hamburg', name: 'Hamburg' },
  { id: id(), code: 'DE_Munich', name: 'Munich' },

  // Greece
  { id: id(), code: 'GR', name: 'Greece' },
  { id: id(), code: 'GR_Athens', name: 'Athens' },
  { id: id(), code: 'GR_Crete', name: 'Crete' },
  { id: id(), code: 'GR_Santorini', name: 'Santorini' },

  // Italy
  { id: id(), code: 'IT', name: 'Italy' },
  { id: id(), code: 'IT_Rome', name: 'Rome' },
  { id: id(), code: 'IT_Milan', name: 'Milan' },
  { id: id(), code: 'IT_Naples', name: 'Naples' },

  // Netherlands
  { id: id(), code: 'NL', name: 'Netherlands' },
  { id: id(), code: 'NL_Amsterdam', name: 'Amsterdam' },
  { id: id(), code: 'NL_Rotterdam', name: 'Rotterdam' },

  // Norway
  { id: id(), code: 'NO', name: 'Norway' },
  { id: id(), code: 'NO_Oslo', name: 'Oslo' },

  // Poland
  { id: id(), code: 'PL', name: 'Poland' },
  { id: id(), code: 'PL_Warsaw', name: 'Warsaw' },

  // Portugal
  { id: id(), code: 'PT', name: 'Portugal' },
  { id: id(), code: 'PT_Lisbon', name: 'Lisbon' },
  { id: id(), code: 'PT_Porto', name: 'Porto' },

  // Spain
  { id: id(), code: 'ES', name: 'Spain' },
  { id: id(), code: 'ES_Madrid', name: 'Madrid' },
  { id: id(), code: 'ES_Barcelona', name: 'Barcelona' },
  { id: id(), code: 'ES_Valencia', name: 'Valencia' },

  // Sweden
  { id: id(), code: 'SE', name: 'Sweden' },
  { id: id(), code: 'SE_Stockholm', name: 'Stockholm' },

  // Switzerland
  { id: id(), code: 'CH', name: 'Switzerland' },
  { id: id(), code: 'CH_Geneva', name: 'Geneva' },
  { id: id(), code: 'CH_Zurich', name: 'Zurich' },

  // UK
  { id: id(), code: 'UK', name: 'United Kingdom' },
  { id: id(), code: 'UK_Glasgow', name: 'Glasgow' },
  { id: id(), code: 'UK_London', name: 'London' },
  { id: id(), code: 'UK_Manchester', name: 'Manchester' },
];

export const ENTITY_HIERARCHY_RELATIONS = {
  covidau: {
    covidau: ['AU'],
    AU: [
      'AU_New_South_Wales',
      'AU_Queensland',
      'AU_Tasmania',
      'AU_Victoria',
      'AU_Western_Australia',
    ],
    AU_New_South_Wales: [
      'AU_New_South_Wales_Albury',
      'AU_New_South_Wales_Byron',
      'AU_New_South_Wales_Sydney',
    ],
    AU_Queensland: ['AU_Queensland_Brisbane', 'AU_Queensland_Cairns'],
    AU_Tasmania: [],
    AU_Victoria: ['AU_Victoria_Ballarat', 'AU_Victoria_Melbourne'],
    AU_Western_Australia: [],
  },
  empty: {
    empty: [],
  },
  europe: {
    europe: ['AT', 'CH', 'CZ', 'DE', 'DK', 'ES', 'FR', 'GR', 'IT', 'NL', 'NO', 'PL', 'PT', 'UK'],
    AT: ['AT_Vienna'],
    CH: ['CH_Geneva', 'CH_Zurich'],
    CZ: ['CZ_Prague'],
    DE: ['DE_Berlin', 'DE_Frankfurt', 'DE_Hamburg', 'DE_Munich'],
    DK: ['DK_Copenhagen'],
    ES: ['ES_Madrid', 'ES_Barcelona', 'ES_Valencia'],
    FR: ['FR_Lyon', 'FR_Nice', 'FR_Paris'],
    GR: ['GR_Athens', 'GR_Crete', 'GR_Santorini'],
    IT: ['IT_Rome', 'IT_Milan', 'IT_Naples'],
    NL: ['NL_Amsterdam', 'NL_Rotterdam'],
    NO: ['NO_Oslo'],
    PL: ['PL_Warsaw'],
    PT: ['PT_Lisbon', 'PT_Porto'],
    SE: ['SE_Stockholm'],
    UK: ['UK_Glasgow', 'UK_London', 'UK_Manchester'],
  },
};
