/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { EntitiesPage as BaseEntitiesPage } from '@tupaia/admin-panel';
import { getSurveyResponsePageConfigs } from '../helpers/getSurveyResponsePageConfigs';
import { getColumnFilter } from '../../table/columnTypes';
import { getBaseEditorConfigs, getDeleteConfigs, getImportConfigs } from '../helpers';
import { getDeleteColumnConfigs } from '../helpers/getDeleteColumnConfigs';

const ENTITIES_ENDPOINT = 'entities';

export const EntitiesPage = ({ getHeaderEl, translate }) => {
  const { SURVEY_RESPONSE_COLUMNS } = getSurveyResponsePageConfigs({ translate });
  const ANSWER_FIELDS = [
    {
      Header: translate('admin.question'),
      source: 'question.text',
      editable: false,
      type: 'tooltip',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.answer'),
      source: 'text',
      type: 'tooltip',
      Filter: getColumnFilter(translate),
    },
  ];

  const ANSWER_COLUMNS = [
    ...ANSWER_FIELDS,
    {
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: 'answers',
        fields: ANSWER_FIELDS,
      },
    },
  ];

  const ENTITIES_COLUMNS = [
    { source: 'id', show: false },
    {
      Header: translate('admin.code'),
      source: 'code',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.name'),
      source: 'name',
      type: 'tooltip',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.type'),
      source: 'type',
      Filter: getColumnFilter(translate),
    },
  ];

  const FIELDS = [
    ...ENTITIES_COLUMNS,
    {
      Header: translate('admin.country'),
      source: 'country_code',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.edit'),
      source: 'id',
      type: 'edit',
      actionConfig: {
        editEndpoint: ENTITIES_ENDPOINT,
        title: translate('admin.edit'),
        fields: [
          {
            Header: translate('admin.name'),
            source: 'name',
          },
        ],
      },
    },
    getDeleteColumnConfigs(ENTITIES_ENDPOINT, translate),
  ];

  const EXPANSION_CONFIG = [
    {
      title: 'Survey Responses',
      endpoint: 'entities/{id}/surveyResponses',
      columns: SURVEY_RESPONSE_COLUMNS,
      expansionTabs: [
        {
          title: translate('admin.answers'),
          endpoint: 'surveyResponses/{id}/answers',
          columns: ANSWER_COLUMNS,
        },
      ],
    },
  ];

  const IMPORT_CONFIG = getImportConfigs(translate, {
    subtitle:
      'Please note that if this is the first time a country is being imported, you will need to restart central-server post-import for it to sync to DHIS2.', // hope to fix one day in https://github.com/beyondessential/central-server/issues/481
    actionConfig: {
      importEndpoint: 'entities',
    },
    queryParameters: [
      {
        label: 'Push new entities to DHIS2 server',
        parameterKey: 'pushToDhis',
        type: 'boolean',
        editConfig: {
          type: 'boolean',
        },
      },
      {
        label: 'Automatically fetch GeoJSON (defaults to "Yes")',
        parameterKey: 'automaticallyFetchGeojson',
        type: 'boolean',
        editConfig: {
          type: 'boolean',
        },
      },
    ],
  });

  return (
    <BaseEntitiesPage
      title={translate('admin.entities')}
      endpoint={ENTITIES_ENDPOINT}
      columns={FIELDS}
      expansionTabs={EXPANSION_CONFIG}
      importConfig={IMPORT_CONFIG}
      deleteConfig={getDeleteConfigs(translate)}
      editorConfig={getBaseEditorConfigs(translate)}
      getHeaderEl={getHeaderEl}
    />
  );
};

EntitiesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};
