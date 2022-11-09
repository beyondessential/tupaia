/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import moment from 'moment';
import { getBrowserTimeZone } from '@tupaia/utils';

const APPROVAL_STATUS_TYPES = [
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Approved', value: 'approved' },
];

const surveyName = {
  Header: 'admin.survey',
  source: 'survey.name',
  editable: false,
  type: 'tooltip',
};

const assessorName = {
  Header: 'admin.assessor',
  source: 'assessor_name',
  editable: false,
};

const date = {
  Header: 'admin.dateOfSurvey',
  source: 'end_time',
  type: 'tooltip',
  accessor: row => moment(row.end_time).local().format('ddd, MMM Do YYYY, HH:mm:ss ZZ'),
  filterable: false,
  editable: false,
};

const dateOfData = {
  Header: 'admin.dateOfData',
  source: 'data_time',
  type: 'tooltip',
  accessor: row => moment.parseZone(row.data_time).format('ddd, MMM Do YYYY, HH:mm:ss'),
  filterable: false,
  editConfig: {
    type: 'datetime-utc',
    accessor: record => moment.parseZone(record.data_time).toString(),
  },
};

const entityName = {
  Header: 'admin.entity',
  source: 'entity.name',
  editConfig: {
    optionsEndpoint: 'entities',
  },
};

export const getSurveyResponsePageColumns = translate => {
  const SURVEY_RESPONSE_COLUMNS = [
    surveyName,
    assessorName,
    date,
    dateOfData,
    {
      Header: 'admin.export',
      source: 'id',
      type: 'export',
      actionConfig: {
        exportEndpoint: 'surveyResponses',
        extraQueryParameters: {
          timeZone: getBrowserTimeZone(),
        },
      },
    },
  ];

  const actionConfig = {
    title: 'Edit Survey Response',
    editEndpoint: 'surveyResponses',
    fields: [
      entityName,
      surveyName,
      assessorName,
      date,
      dateOfData,
      {
        Header: 'admin.approvalStatus',
        source: 'approval_status',
        editConfig: {
          options: APPROVAL_STATUS_TYPES,
        },
      },
    ].map(field => ({ ...field, Header: translate(field.Header) })),
  };

  return [
    entityName,
    ...SURVEY_RESPONSE_COLUMNS,
    {
      Header: 'admin.edit',
      type: 'edit',
      source: 'id',
      actionConfig,
    },
    {
      Header: 'admin.delete',
      source: 'id',
      type: 'delete',
      actionConfig: {
        endpoint: 'surveyResponses',
      },
    },
  ];
};
