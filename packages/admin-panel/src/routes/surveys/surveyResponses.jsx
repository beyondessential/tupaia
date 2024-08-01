/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { getBrowserTimeZone } from '@tupaia/utils';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { SurveyResponsesExportModal } from '../../importExport';
import { getPluralForm } from '../../pages/resources/resourceName';
import { OutdatedFilter } from '../../table/columnTypes/columnFilters';

const RESOURCE_NAME = { singular: 'survey response' };

const GREEN = '#47CA80';
const GREY = '#898989';

const Pill = styled.span`
  background-color: ${({ $color }) => {
    return `${$color}33`; // slightly transparent
  }};
  border-radius: 1.5rem;
  padding: 0.3rem 0.9rem;
  color: ${({ $color }) => $color};
  .cell-content:has(&) > div {
    overflow: visible;
  }
`;

const ResponseStatusPill = ({ value }) => {
  const text = value ? 'Outdated' : 'Current';
  const color = value ? GREEN : GREY;
  return <Pill $color={color}>{text}</Pill>;
};

ResponseStatusPill.propTypes = {
  value: PropTypes.bool,
};

ResponseStatusPill.defaultProps = {
  value: false,
};

const surveyName = {
  Header: 'Survey',
  source: 'survey.name',
  editable: false,
};

const surveyId = {
  Header: 'Survey ID',
  source: 'survey.id',
  editable: false,
  show: false,
};

const assessorName = {
  Header: 'Assessor',
  source: 'assessor_name',
  editable: false,
};

const date = {
  Header: 'Date of survey',
  source: 'end_time',
  accessor: row => moment(row.end_time).local().format('ddd, MMM Do YYYY, HH:mm:ss ZZ'),
  filterable: false,
  editable: false,
};

const dateOfData = {
  Header: 'Date of data',
  source: 'data_time',
  accessor: row => moment.parseZone(row.data_time).format('ddd, MMM Do YYYY, HH:mm:ss'),
  filterable: false,
  editConfig: {
    type: 'datetime-utc',
    accessor: record => moment.parseZone(record.data_time).toString(),
  },
};

const responseStatus = {
  Header: 'Response status',
  source: 'outdated',
  Filter: OutdatedFilter,
  width: 180,
  // eslint-disable-next-line react/prop-types
  Cell: ({ value }) => <ResponseStatusPill value={value} />,
};

const entityName = {
  Header: 'Entity',
  source: 'entity.name',
  editConfig: {
    optionsEndpoint: 'entities',
  },
};

const countryName = {
  Header: 'Country',
  source: 'country.name',
};

export const SURVEY_RESPONSE_COLUMNS = [
  surveyId,
  surveyName,
  assessorName,
  date,
  dateOfData,
  responseStatus,
  {
    Header: 'Export',
    type: 'export',
    source: 'id',
    actionConfig: {
      exportEndpoint: 'surveyResponses',
      extraQueryParameters: {
        timeZone: getBrowserTimeZone(),
      },
    },
  },
];

export const SURVEY_RESPONSE_PAGE_COLUMNS = [
  countryName,
  entityName,
  ...SURVEY_RESPONSE_COLUMNS,
  {
    Header: 'Resubmit',
    type: 'resubmitSurveyResponse',
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: 'surveyResponses',
    },
  },
];

export const ANSWER_COLUMNS = [
  {
    Header: 'Question',
    source: 'question.text',
    editable: false,
  },
  {
    Header: 'Answer',
    source: 'text',
    type: 'tooltip',
    accessor: row => {
      return row['entity.code'] || row.text;
    },
  },
  {
    Header: 'EntityName',
    show: false,
    source: 'entity.code',
  },
];

const IMPORT_CONFIG = {
  title: `Import ${getPluralForm(RESOURCE_NAME)}`,
  actionConfig: {
    importEndpoint: 'surveyResponses',
    extraQueryParameters: {
      timeZone: getBrowserTimeZone(),
      respondWithEmailTimeout: 10 * 1000, // if an import doesn't finish in 10 seconds, email results
    },
  },
  queryParameters: [
    {
      label: 'Surveys',
      labelTooltip:
        'Please enter the surveys for the responses to be imported against. Each tab in the file should be a matching survey code. Leave blank to import all tabs.',
      parameterKey: 'surveyCodes',
      optionsEndpoint: 'surveys',
      optionValueKey: 'code',
      allowMultipleValues: true,
    },
  ],
};

export const surveyResponses = {
  resourceName: RESOURCE_NAME,
  path: '/survey-responses',
  endpoint: 'surveyResponses',
  columns: SURVEY_RESPONSE_PAGE_COLUMNS,
  importConfig: IMPORT_CONFIG,
  defaultFilters: [{ id: 'outdated', value: false }],
  defaultSorting: [{ id: 'data_time', desc: true }],
  ExportModalComponent: SurveyResponsesExportModal,
  nestedViews: [
    {
      title: 'Answers',
      columns: ANSWER_COLUMNS,
      endpoint: 'surveyResponses/{id}/answers',
      path: '/:id/answers',
      displayProperty: 'survey.name',
    },
  ],
};
