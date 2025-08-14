export const ENTITIES = [
  { code: 'test', name: 'Test Project', type: 'project' },
  { code: 'explore', name: 'Explore', type: 'project' },
  { code: 'AU', name: 'Australia', type: 'country' },
  { code: 'FJ', name: 'Fiji', type: 'country' },
  { code: 'PG', name: 'PNG', type: 'country' },
  {
    code: 'AU_Facility1',
    name: 'Australian Facility 1',
    type: 'facility',
  },
  {
    code: 'AU_Facility2',
    name: 'Australian Facility 2',
    type: 'facility',
  },
  {
    code: 'PG_Facility',
    name: 'PNG Facility',
    type: 'facility',
  },
  { code: 'FJ_Facility', name: 'Fiji Facility', type: 'facility' },
  { code: 'VU_Facility1', attributes: { x: 5, y: 'hello', z: {} } },
  { code: 'VU_Facility2', attributes: { x: 6 } },
];

export const ENTITY_RELATIONS = {
  explore: [
    { parent: 'explore', child: 'AU' },
    { parent: 'explore', child: 'FJ' },
    { parent: 'AU', child: 'AU_Facility1' },
    { parent: 'AU', child: 'AU_Facility2' },
    { parent: 'FJ', child: 'FJ_Facility' },
  ],
  test: [
    { parent: 'test', child: 'PG' },
    { parent: 'test', child: 'FJ' },
    { parent: 'PG', child: 'PG_Facility' },
    { parent: 'FJ', child: 'FJ_Facility' },
  ],
};

export const CENTRAL_API_RESPONSES = {
  surveyResponses: [
    {
      'survey_response.id': '1',
      'survey_response.assessor_name': 'Bob',
      'survey_response.data_time': new Date('2020-01-01'),
      'survey_response.outdated': false,
      'survey.id': '1',
      'survey.name': 'Survey 1',
      'survey.code': 'survey1',
      'entity.name': 'Australia',
      'country.name': 'Australia',
    },
    {
      'survey_response.id': '2',
      'survey_response.assessor_name': 'Jane',
      'survey_response.data_time': new Date('2021-01-01'),
      'survey_response.outdated': true,
      'survey.id': '2',
      'survey.name': 'Survey 2',
      'survey.code': 'survey2',
      'entity.name': 'Fiji',
      'country.name': 'Fiji',
    },
  ],
};
