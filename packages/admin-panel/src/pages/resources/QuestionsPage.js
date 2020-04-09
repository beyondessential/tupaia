/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ResourcePage } from './ResourcePage';

const QUESTION_FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    editable: false,
  },
  {
    Header: 'Type',
    source: 'type',
  },
  {
    Header: 'Indicator',
    source: 'indicator',
  },
  {
    Header: 'Question',
    source: 'text',
  },
  //{ Header: 'Options', source: 'options' },
  {
    Header: 'Detail',
    source: 'detail',
  },
];

const QUESTION_COLUMNS = [
  ...QUESTION_FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'question',
      fields: QUESTION_FIELDS,
    },
  },
];

const IMPORT_CONFIG = {
  title: 'Import Questions',
  actionConfig: {
    importEndpoint: 'questions',
  },
  queryParameters: [
    {
      label: 'Survey Names',
      instruction:
        'Please enter the names of the surveys to be imported. These should match the tab names in the file.',
      parameterKey: 'surveyNames',
      optionsEndpoint: 'surveys',
      optionValueKey: 'name',
      allowMultipleValues: true,
      canCreateNewOptions: true,
    },
    {
      label: 'Countries',
      instruction:
        'Select the countries this survey should be available in, or leave blank for all',
      parameterKey: 'countryIds',
      optionsEndpoint: 'countries',
      allowMultipleValues: true,
    },
    {
      label: 'Permission Group',
      instruction:
        'Select the permission group this survey should be available for, or leave blank for Public',
      parameterKey: 'permissionGroup',
      optionsEndpoint: 'permissionGroups',
      optionValueKey: 'name',
    },
    {
      label: 'Survey Group',
      instruction:
        'Select the survey group this survey should be a part of, or leave blank for none',
      parameterKey: 'surveyGroup',
      optionsEndpoint: 'surveyGroups',
      canCreateNewOptions: true,
      optionValueKey: 'name',
    },
  ],
};

const EDIT_CONFIG = {
  title: 'Edit Question',
};

export const QuestionsPage = () => (
  <ResourcePage
    title="Questions"
    endpoint="questions"
    columns={QUESTION_COLUMNS}
    importConfig={IMPORT_CONFIG}
    editConfig={EDIT_CONFIG}
  />
);
