/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

const SURVEY_FIELDS = [
  {
    Header: 'Name',
    source: 'name',
  },
  {
    Header: 'Code',
    source: 'code',
  },
  {
    Header: 'Permission Group',
    source: 'permission_group.name',
    editConfig: {
      optionsEndpoint: 'permissionGroups',
    },
  },
  {
    Header: 'Survey Group',
    source: 'survey_group.name',
    editConfig: {
      optionsEndpoint: 'surveyGroups',
    },
  },
  {
    Header: 'Repeating',
    source: 'can_repeat',
    type: 'boolean',
    editConfig: {
      type: 'boolean',
    },
  },
];

const SURVEY_COLUMNS = [
  ...SURVEY_FIELDS,
  {
    Header: 'Export',
    source: 'id',
    type: 'export',
    actionConfig: {
      exportEndpoint: 'survey',
      fileName: '{name}',
    },
  },
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'survey',
      fields: [
        ...SURVEY_FIELDS,
        {
          Header: 'Data Service',
          source: 'data_source.service_type',
          editConfig: {
            options: [
              {
                label: 'DHIS',
                value: 'dhis',
              },
              {
                label: 'Tupaia',
                value: 'tupaia',
              },
            ],
            setFieldsOnChange: (newValue, currentRecord) => {
              const { isDataRegional = true } = currentRecord['data_source.config'];
              const config = newValue === 'dhis' ? { isDataRegional } : {};
              return { 'data_source.config': config };
            },
          },
        },
        {
          Header: 'Data Service Configuration',
          source: 'data_source.config',
          editConfig: {
            type: 'json',
            getJsonFieldSchema: (_, { recordData }) =>
              recordData['data_source.service_type'] === 'dhis'
                ? [
                    {
                      label:
                        'Stored On Regional Server (Choose "No" if stored on country specific server)',
                      fieldName: 'isDataRegional',
                      type: 'boolean',
                    },
                  ]
                : [],
          },
        },
        {
          Header: 'Integration Details',
          source: 'integration_metadata',
          editConfig: {
            type: 'json',
            getJsonFieldSchema: () => [
              {
                label: 'MS1',
                fieldName: 'ms1',
                type: 'json',
                variant: 'grey',
                getJsonFieldSchema: () => [
                  {
                    label: 'Endpoint',
                    fieldName: 'endpoint',
                    type: 'json',
                    getJsonFieldSchema: () => [
                      {
                        label: 'Route',
                        fieldName: 'route',
                      },
                      {
                        label: 'Method (POST or PUT)',
                        fieldName: 'method',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: 'survey',
    },
  },
];

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
    Header: 'Name',
    source: 'name',
  },
  {
    Header: 'Question',
    source: 'text',
  },
  {
    Header: 'Detail',
    source: 'detail',
  },
  {
    Header: 'Question Label',
    source: 'question_label',
  },
  {
    Header: 'Detail Label',
    source: 'detail_label',
  },
];

const QUESTION_COLUMNS = [
  ...QUESTION_FIELDS,
  {
    Header: 'Config',
    source: 'config',
  },
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'surveyScreenComponent',
      fields: [
        ...QUESTION_FIELDS,
        {
          Header: 'Config',
          source: 'config',
          editConfig: {
            type: 'json',
            getJsonFieldSchema: () => [
              {
                label: 'Entity',
                fieldName: 'entity',
                type: 'json',
                getJsonFieldSchema: () => [
                  {
                    label: 'Accepted Types (comma separated values)',
                    fieldName: 'type',
                    csv: true,
                  },
                  {
                    label: 'Create New',
                    fieldName: 'createNew',
                    type: 'boolean',
                  },
                  {
                    label: 'Parent Entity',
                    fieldName: 'parentId',
                    type: 'json',
                    getJsonFieldSchema: () => [{ label: 'Question Id', fieldName: 'questionId' }],
                  },
                  {
                    label: 'Grandparent Entity',
                    fieldName: 'grandparentId',
                    type: 'json',
                    getJsonFieldSchema: () => [{ label: 'Question Id', fieldName: 'questionId' }],
                  },
                  {
                    label: 'Name',
                    fieldName: 'name',
                    type: 'json',
                    getJsonFieldSchema: () => [{ label: 'Question Id', fieldName: 'questionId' }],
                  },
                  {
                    label: 'Code',
                    fieldName: 'code',
                    type: 'json',
                    getJsonFieldSchema: () => [{ label: 'Question Id', fieldName: 'questionId' }],
                  },
                ],
              },
              {
                label: 'Code Generator',
                fieldName: 'codeGenerator',
                type: 'json',
                getJsonFieldSchema: () => [
                  { label: 'Type', fieldName: 'type' },
                  { label: 'Prefix', fieldName: 'prefix' },
                  { label: 'Length', fieldName: 'length' },
                ],
              },
            ],
          },
        },
      ],
    },
  },
];

const EXPANSION_CONFIG = [
  {
    title: 'Questions',
    endpoint: 'survey/{id}/surveyScreenComponents',
    columns: QUESTION_COLUMNS,
  },
];

const IMPORT_CONFIG = {
  title: 'Import Surveys',
  actionConfig: {
    importEndpoint: 'surveys',
  },
  queryParameters: [
    {
      label: 'Survey Names',
      secondaryLabel:
        'Please enter the names of the surveys to be imported. These should match the tab names in the file.',
      parameterKey: 'surveyNames',
      optionsEndpoint: 'surveys',
      optionValueKey: 'name',
      allowMultipleValues: true,
      canCreateNewOptions: true,
    },
    {
      label: 'Countries',
      secondaryLabel:
        'Select the countries this survey should be available in, or leave blank for all',
      parameterKey: 'countryIds',
      optionsEndpoint: 'countries',
      allowMultipleValues: true,
    },
    {
      label: 'Permission Group',
      secondaryLabel:
        'Select the permission group this survey should be available for, or leave blank for Public',
      parameterKey: 'permissionGroup',
      optionsEndpoint: 'permissionGroups',
      optionValueKey: 'name',
    },
    {
      label: 'Survey Group',
      secondaryLabel:
        'Select the survey group this survey should be a part of, or leave blank for none',
      parameterKey: 'surveyGroup',
      optionsEndpoint: 'surveyGroups',
      canCreateNewOptions: true,
      optionValueKey: 'name',
    },
    {
      label: 'Data service',
      secondaryLabel: 'Select the data service this survey should use, or leave blank for tupaia',
      parameterKey: 'serviceType',
      options: [
        {
          label: 'DHIS',
          value: 'dhis',
        },
        {
          label: 'Tupaia',
          value: 'tupaia',
        },
      ],
    },
  ],
};

const EDIT_CONFIG = {
  title: 'Edit Survey',
};

export const SurveysPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Surveys"
    endpoint="surveys"
    columns={SURVEY_COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    importConfig={IMPORT_CONFIG}
    editConfig={EDIT_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

SurveysPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
