/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import { SurveyEditFields } from '../../surveys/SurveyEditFields';

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

const SURVEY_FIELDS = {
  name: {
    Header: 'Name',
    source: 'name',
    type: 'tooltip',
    editConfig: {
      maxLength: 50,
      secondaryLabel: 'Max length: 50 characters',
    },
  },
  code: {
    Header: 'Code',
    source: 'code',
    editConfig: {
      secondaryLabel: 'A short unique code. Suggestions appear when you enter a name.',
    },
  },
  country_ids: {
    Header: 'Countries',
    source: 'countryNames', // TODO: cleanup as part of RN-910
    editConfig: {
      sourceKey: 'countryNames',
      optionsEndpoint: 'countries',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      allowMultipleValues: true,
      secondaryLabel: 'Select the countries this survey should be available in',
    },
  },
  permission_group_id: {
    Header: 'Permission Group',
    source: 'permission_group.name', // TODO: cleanup as part of RN-910
    editConfig: {
      sourceKey: 'permission_group.name',
      optionsEndpoint: 'permissionGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      secondaryLabel: 'Select the permission group this survey should be available for',
    },
  },
  survey_group_id: {
    Header: 'Survey Group',
    source: 'survey_group.name', // TODO: cleanup as part of RN-910
    editConfig: {
      sourceKey: 'survey_group.name',
      optionsEndpoint: 'surveyGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      secondaryLabel:
        'Select the survey group this survey should be a part of, or leave blank for none',
      canCreateNewOptions: true,
    },
  },
  can_repeat: {
    Header: 'Repeating',
    source: 'can_repeat',
    type: 'boolean',
    editConfig: {
      type: 'boolean',
    },
  },
  period_granularity: {
    Header: 'Reporting Period',
    source: 'period_granularity',
    editConfig: {
      options: [{ label: 'None', value: '' }, ...PERIOD_GRANULARITIES],
      secondaryLabel:
        'Select a reporting period if new responses should overwrite previous ones within the same period',
    },
  },
  requires_approval: {
    Header: 'Requires Approval',
    source: 'requires_approval',
    type: 'boolean',
    editConfig: {
      type: 'boolean',
      secondaryLabel:
        'Select whether survey responses require approval before their data appear in visualisations',
    },
  },
  'data_group.service_type': {
    Header: 'Data Service',
    source: 'data_group.service_type',
    editConfig: {
      secondaryLabel: 'Select the data service this survey should use',
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
  'data_group.config': {
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
  integration_metadata: {
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
  surveyQuestions: {
    Header: 'Survey Questions',
    source: 'surveyQuestions',
    editConfig: {
      type: 'file',
      name: 'surveyQuestions',
      secondaryLabel:
        'Import a questions spreadsheet to update the questions and screens of this survey.',
    },
  },
};

const SURVEY_COLUMNS = [
  {
    Header: 'Project',
    source: 'project.code',
  },
  SURVEY_FIELDS.name,
  SURVEY_FIELDS.code,
  {
    Header: 'Permission Group',
    source: 'permission_group.name',
  },
  {
    Header: 'Survey Group',
    source: 'survey_group.name',
  },
  SURVEY_FIELDS.can_repeat,
  SURVEY_FIELDS.period_granularity,
  {
    Header: 'Service Type',
    source: 'data_group.service_type',
  },
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
      fields: [...Object.values(SURVEY_FIELDS)],
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
    // All fields except Integration Metadata
    // (Only one project uses it, hidden to improve UX for everyone else, see MDEV-48)
    fields: [
      SURVEY_FIELDS.name,
      SURVEY_FIELDS.code,
      SURVEY_FIELDS.country_ids,
      SURVEY_FIELDS.permission_group_id,
      SURVEY_FIELDS.survey_group_id,
      SURVEY_FIELDS.can_repeat,
      SURVEY_FIELDS.period_granularity,
      SURVEY_FIELDS.requires_approval,
      SURVEY_FIELDS['data_group.service_type'],
      SURVEY_FIELDS['data_group.config'],
      SURVEY_FIELDS.surveyQuestions,
    ],
    // Custom component needed because on create we suggest the code
    FieldsComponent: SurveyEditFields,
    initialValues: {
      can_repeat: false,
      requires_approval: false,
      'data_group.service_type': 'tupaia',
      'data_group.config': {},
    },
    title: 'New Survey',
  },
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
                    label: 'Create New',
                    fieldName: 'createNew',
                    type: 'boolean',
                  },
                  {
                    label: 'Allow Scan QR Code',
                    fieldName: 'allowScanQrCode',
                    type: 'boolean',
                  },
                  {
                    label: 'Generate QR Code',
                    fieldName: 'generateQrCode',
                    type: 'boolean',
                  },
                  {
                    label: 'Hide Parent Entity Name',
                    fieldName: 'hideParentName',
                    type: 'boolean',
                  },
                  {
                    label: 'Filter',
                    fieldName: 'filter',
                    type: 'json',
                    getJsonFieldSchema: () => [
                      {
                        label: 'Accepted Types (comma separated values)',
                        fieldName: 'type',
                        csv: true,
                      },
                      {
                        label: 'Parent Entity',
                        fieldName: 'parentId',
                        type: 'json',
                        getJsonFieldSchema: () => [
                          { label: 'Question Id', fieldName: 'questionId' },
                        ],
                      },
                      {
                        label: 'Grandparent Entity',
                        fieldName: 'grandparentId',
                        type: 'json',
                        getJsonFieldSchema: () => [
                          { label: 'Question Id', fieldName: 'questionId' },
                        ],
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
                    ],
                  },
                  {
                    label: 'Fields',
                    fieldName: 'fields',
                    type: 'json',
                    getJsonFieldSchema: () => [
                      {
                        label: 'Type',
                        fieldName: 'type',
                      },
                      {
                        label: 'Parent Entity',
                        fieldName: 'parentId',
                        type: 'json',
                        getJsonFieldSchema: () => [
                          { label: 'Question Id', fieldName: 'questionId' },
                        ],
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
                        getJsonFieldSchema: () => [
                          { label: 'Question Id', fieldName: 'questionId' },
                        ],
                      },
                      {
                        label: 'Code',
                        fieldName: 'code',
                        type: 'json',
                        getJsonFieldSchema: () => [
                          { label: 'Question Id', fieldName: 'questionId' },
                        ],
                      },
                    ],
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
    title="Surveys"
    endpoint="surveys"
    columns={SURVEY_COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
    {...restOfProps}
  />
);

SurveysPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
