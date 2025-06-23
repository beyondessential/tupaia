export const HIERARCHY = 'test_hierarchy';
export const ENTITIES = [
  { code: 'TO', name: 'Tonga', type: 'country' },
  {
    code: 'TO_Island_1',
    name: 'Tonga Island 1',
    type: 'district',
  },
  {
    code: 'TO_Island_2',
    name: 'Tonga Island 2',
    type: 'district',
  },
  {
    code: 'TO_Village_1',
    name: 'Tonga Village 1',
    type: 'village',
  },
  {
    code: 'TO_Village_2',
    name: 'Tonga Village 2',
    type: 'village',
  },
  {
    code: 'TO_Village_3',
    name: 'Tonga Village 3',
    type: 'village',
  },
  {
    code: 'TO_Individual_1',
    name: 'Tonga Individual 1',
    type: 'individual',
  },
  {
    code: 'TO_Individual_2',
    name: 'Tonga Individual 2',
    type: 'individual',
  },
  {
    code: 'TO_Individual_3',
    name: 'Tonga Individual 3',
    type: 'individual',
  },
  {
    code: 'TO_Individual_4',
    name: 'Tonga Individual 4',
    type: 'individual',
  },
  {
    code: 'TO_Individual_5',
    name: 'Tonga Individual 5',
    type: 'individual',
  },
];

export const RELATIONS = {
  test_hierarchy: [
    { parent: 'TO', child: 'TO_Island_1' },
    { parent: 'TO', child: 'TO_Island_2' },
    { parent: 'TO_Island_1', child: 'TO_Village_1' },
    { parent: 'TO_Island_1', child: 'TO_Village_2' },
    { parent: 'TO_Island_2', child: 'TO_Village_3' },
    { parent: 'TO_Village_1', child: 'TO_Individual_1' },
    { parent: 'TO_Village_1', child: 'TO_Individual_2' },
    { parent: 'TO_Village_2', child: 'TO_Individual_3' },
    { parent: 'TO_Village_3', child: 'TO_Individual_4' },
    { parent: 'TO_Village_3', child: 'TO_Individual_5' },
  ],
};

const C19TRegistrationEvents = [
  {
    orgUnit: 'TO_Individual_1',
    eventDate: '1920-01-01',
    dataValues: {
      C19T002: 'Sausages',
      C19T003: 'Silly',
      C19T004: '2020-01-01',
      C19T005: 'Male',
      C19T006: '9182487324',
    },
  },
  {
    orgUnit: 'TO_Individual_2',
    eventDate: '1921-11-12',
    dataValues: {
      C19T002: 'Whiskers',
      C19T003: 'Paddington',
      C19T004: '1970-01-01',
      C19T005: 'Female',
      C19T006: '9012837273',
    },
  },
  {
    orgUnit: 'TO_Individual_4',
    eventDate: '1924-12-01',
    dataValues: {
      C19T002: 'Junior',
      C19T003: 'Super',
      C19T004: '1990-09-13',
      C19T005: 'Other',
      C19T006: '08090928',
    },
  },
];

const C19TResultsEvents = [
  {
    orgUnit: 'TO_Individual_2',
    eventDate: '2020-01-01',
    dataValues: {
      C19T012: 'Flu',
      C19T013: 'Basic',
      C19T013_a: 7,
      C19T015: 1,
      C19T015_a: 0,
      C19T016: 1,
      C19T042: '19/09/2022',
      C19T017: 1,
      C19T018: 1,
      C19T019: 0,
      C19T022: 'No',
      C19T020: 1,
      C19T038: 0,
      C19T039: 0,
      C19T044: '13/09/2022',
      C19T024: 'Disney Land',
      C19T025: 'Car park',
      C19T026: 'Good',
      C19T027: 'Roomy',
      C19T028: 'Soccer pitch',
      C19T041: 'What?',
      C19T029: 'Nope',
      C19T033: 13,
      C19T034: 7,
      C19T035: 1,
      C19T036: 0,
      C19T037: 'N/A',
      C19T043: 'Fully vaccinated',
    },
  },
  {
    orgUnit: 'TO_Individual_4',
    eventDate: '2020-05-19',
    dataValues: {
      C19T012: 'Covid',
      C19T013: 'Antigen',
      C19T013_a: 4,
      C19T015: 0,
      C19T015_a: 1,
      C19T016: 0,
      C19T017: 0,
      C19T018: 0,
      C19T019: 0,
      C19T021: 'None',
      C19T022: 'No',
      C19T020: 0,
      C19T038: 0,
      C19T039: 0,
      C19T044: 'N/A',
      C19T024: 'Space',
      C19T025: 'Salvos',
      C19T026: 'Not bad',
      C19T027: 'Circular',
      C19T028: 'Van',
      C19T041: 'Is RRT?',
      C19T029: 'None',
      C19T033: 2,
      C19T034: 4,
      C19T035: 0,
      C19T036: 0,
      C19T037: 'N/A',
      C19T043: 'Partially vaccinated',
    },
  },
];

export const EVENTS: Record<string, { orgUnit: string; dataValues: Record<string, unknown> }[]> = {
  C19T_Registration: C19TRegistrationEvents,
  C19T_Results: C19TResultsEvents,
};
