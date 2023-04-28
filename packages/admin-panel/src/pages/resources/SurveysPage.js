/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

const PERIOD_GRANULARITIES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
];

const SERVICE_TYPES = [
  { label: 'DHIS', value: 'dhis' },
  { label: 'Tupaia', value: 'tupaia' },
];

const FIELDS = [
  {
    Header: 'Name',
    source: 'name',
    type: 'tooltip',
  },
  {
    Header: 'Code',
    source: 'code',
  },
  {
    Header: 'Countries',
    source: 'country_ids',
    editConfig: {
      optionsEndpoint: 'countries',
      optionLabelKey: 'name',
      optionValueKey: 'id',
      allowMultipleValues: true,
      secondaryLabel:
        'Select the countries this survey should be available in, or leave blank for all',
    },
  },
  {
    Header: 'Permission Group',
    source: 'permission_group_id',
    editConfig: {
      optionsEndpoint: 'permissionGroups',
      optionLabelKey: 'name',
      optionValueKey: 'id',
      secondaryLabel: 'Select the permission group this survey should be available for',
    },
  },
  {
    Header: 'Survey Group',
    source: 'survey_group_id',
    type: 'autocomplete2',
    editConfig: {
      optionsEndpoint: 'surveyGroups',
      optionLabelKey: 'name',
      optionValueKey: 'id',
      secondaryLabel:
        'Select the survey group this survey should be a part of, or leave blank for none',
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
  {
    Header: 'Reporting Period',
    source: 'period_granularity',
    editConfig: {
      options: [{ label: 'None', value: '' }, ...PERIOD_GRANULARITIES],
      secondaryLabel:
        'Select a reporting period if new responses should overwrite previous ones within the same period',
    },
  },
  {
    Header: 'Requires Approval',
    source: 'requires_approval',
    type: 'boolean',
    editConfig: {
      type: 'boolean',
      secondaryLabel:
        'Select whether survey responses require approval before their data appear in visualisations',
    },
  },
  {
    Header: 'Data Service',
    source: 'data_group.service_type',
    editConfig: {
      secondaryLabel: 'Select the data service this survey should use, or leave blank for tupaia',
      options: SERVICE_TYPES,
      setFieldsOnChange: (newValue, currentRecord = null) => {
        const { dhisInstanceCode = 'regional' } = currentRecord
          ? currentRecord['data_group.config'] ?? {}
          : {};
        const config = newValue === 'dhis' ? { dhisInstanceCode } : {};
        return { 'data_group.config': config };
      },
    },
  },
  {
    Header: 'Data Service Configuration',
    source: 'data_group.config',
    editConfig: {
      type: 'json',
      visibilityCriteria: {
        'data_group.service_type': 'dhis',
      },
      getJsonFieldSchema: (_, { recordData }) =>
        recordData['data_group.service_type'] === 'dhis'
          ? [
              {
                label: 'DHIS Server',
                fieldName: 'dhisInstanceCode',
                optionsEndpoint: 'dhisInstances',
                optionLabelKey: 'code',
                optionValueKey: 'code',
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
];

const SURVEY_COLUMNS = [
  FIELDS[0],
  FIELDS[1],
  {
    Header: 'Permission Group',
    source: 'permission_group.name',
  },
  {
    Header: 'Survey Group',
    source: 'survey_group.name',
  },
  FIELDS[5],
  FIELDS[7],
  {
    Header: 'Export',
    source: 'id',
    type: 'export',
    actionConfig: {
      exportEndpoint: 'surveys',
      fileName: '{name}',
    },
  },
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Survey',
      editEndpoint: 'surveys',
      fields: [...FIELDS],
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: 'surveys',
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: 'surveys',
    fields: [...FIELDS],
    title: 'New Survey',
  },
  label: 'New Survey',
};

const IMPORT_CONFIG = {
  title: 'Import Survey Questions',
  label: 'Import Questions',
  actionConfig: {
    importEndpoint: 'surveys',
  },
  queryParameters: [
    {
      label: 'Surveys',
      secondaryLabel:
        'Please enter the Surveys for the Questions to be imported against. Each tab in the file should be a matching Survey code. Leave blank to import all tabs.',
      parameterKey: 'surveyNames',
      optionsEndpoint: 'surveys',
      optionValueKey: 'code',
      allowMultipleValues: true,
    },
  ],
};

const QUESTION_FIELDS = [
  {
    Header: 'Code',
    source: 'question.code',
    type: 'tooltip',
    editable: false,
  },
  {
    Header: 'Type',
    source: 'question.type',
  },
  {
    Header: 'Name',
    source: 'question.name',
    type: 'tooltip',
  },
  {
    Header: 'Question',
    source: 'question.text',
    type: 'tooltip',
  },
  {
    Header: 'Detail',
    source: 'question.detail',
    type: 'tooltip',
  },
  {
    Header: 'Question Label',
    source: 'question_label',
    type: 'tooltip',
  },
  {
    Header: 'Detail Label',
    source: 'detail_label',
    type: 'tooltip',
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
      title: 'Edit Question',
      editEndpoint: 'surveyScreenComponents',
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
                    label: 'Attributes',
                    fieldName: 'attributes',
                    type: 'json',
                    getJsonFieldSchema: () => [
                      {
                        label: 'Type',
                        fieldName: 'type',
                        type: 'json',
                        getJsonFieldSchema: () => [
                          { label: 'Question Id', fieldName: 'questionId' },
                        ],
                      },
                    ],
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
              {
                label: 'Arithmetic',
                fieldName: 'arithmetic',
                type: 'json',
                getJsonFieldSchema: () => [
                  {
                    label: 'Formula',
                    fieldName: 'formula',
                  },
                  {
                    label: 'Default Values',
                    fieldName: 'defaultValues',
                    type: 'jsonEditor',
                  },
                  {
                    label: 'Value Translation',
                    fieldName: 'valueTranslation',
                    type: 'jsonEditor',
                  },
                  {
                    label: 'Answer Display Text',
                    fieldName: 'answerDisplayText',
                  },
                ],
              },
              {
                label: 'Condition',
                fieldName: 'condition',
                type: 'json',
                getJsonFieldSchema: () => [
                  {
                    label: 'Conditions',
                    fieldName: 'conditions',
                    type: 'jsonEditor',
                  },
                ],
              },
              {
                label: 'Autocomplete',
                fieldName: 'autocomplete',
                type: 'json',
                getJsonFieldSchema: () => [
                  {
                    label: 'Create New',
                    fieldName: 'createNew',
                    type: 'boolean',
                  },
                  {
                    label: 'Attributes',
                    fieldName: 'attributes',
                    type: 'json',
                    getJsonFieldSchema: () => [
                      {
                        label: 'Parent Project',
                        fieldName: 'parent_project',
                        type: 'json',
                        getJsonFieldSchema: () => [
                          { label: 'Question Id', fieldName: 'questionId' },
                        ],
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
];

const EXPANSION_CONFIG = [
  {
    title: 'Questions',
    endpoint: 'surveys/{id}/surveyScreenComponents',
    columns: QUESTION_COLUMNS,
  },
];

export const SurveysPage = ({ getHeaderEl, ...restOfProps }) => (
  <ResourcePage
    model="Survey"
    endpoint="surveys"
    columns={SURVEY_COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    createConfig={CREATE_CONFIG}
    importConfig={IMPORT_CONFIG}
    getHeaderEl={getHeaderEl}
    {...restOfProps}
  />
);

SurveysPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
