export type Analytic = {
  entity_code: string;
  date: string;
  data_element_code: string;
  data_group_code: string;
  event_id: string;
  value: string;
  value_type: string;
};

const sortByDate = (a1: Analytic, a2: Analytic) =>
  // eslint-disable-next-line no-nested-ternary
  a1.date > a2.date ? 1 : a1.date < a2.date ? -1 : 0;

export const TONGA_ANALYTICS: Analytic[] = [
  {
    entity_code: 'TO',
    date: '2020-03-27T23:59:00',
    data_element_code: 'question_A',
    data_group_code: 'cool_survey',
    event_id: 'cfff1801-e35a-4756-924a-cd89e7dc9087',
    value: '12',
    value_type: 'Number',
  },
  {
    entity_code: 'TO',
    date: '2022-03-27T23:59:00',
    data_element_code: 'question_B',
    data_group_code: 'cool_survey',
    event_id: '41fd0528-f2d7-4fea-a9a1-a50ed0c215f1',
    value: '1',
    value_type: 'Number',
  },
].sort(sortByDate);

export const PNG_ANALYTICS: Analytic[] = [
  {
    entity_code: 'PG',
    date: '2020-03-28T23:59:00',
    data_element_code: 'question_A',
    data_group_code: 'cool_survey',
    event_id: 'f22b9545-2a96-44a5-9b07-08c4cb42d875',
    value: '32',
    value_type: 'Number',
  },
  {
    entity_code: 'PG',
    date: '2020-03-28T23:59:00',
    data_element_code: 'question_B',
    data_group_code: 'cool_survey',
    event_id: 'f22b9545-2a96-44a5-9b07-08c4cb42d875',
    value: '78',
    value_type: 'Number',
  },

  {
    entity_code: 'PG',
    date: '2022-03-28T23:59:00',
    data_element_code: 'question_A',
    data_group_code: 'cool_survey',
    event_id: 'af0367f3-edd1-4051-b72a-1a9df9ff0b08',
    value: '2',
    value_type: 'Number',
  },
  {
    entity_code: 'PG',
    date: '2022-03-28T23:59:00',
    data_element_code: 'question_B',
    data_group_code: 'cool_survey',
    event_id: 'af0367f3-edd1-4051-b72a-1a9df9ff0b08',
    value: '7',
    value_type: 'Number',
  },
].sort(sortByDate);

export const TWENTY_TWENTY_ANALYTICS = [
  TONGA_ANALYTICS[0],
  PNG_ANALYTICS[0],
  PNG_ANALYTICS[1],
].sort(sortByDate);

export const ALL_ANALYTICS: Analytic[] = [...TONGA_ANALYTICS, ...PNG_ANALYTICS].sort(sortByDate);
