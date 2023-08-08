/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { SurveysPage as BaseSurveysPage } from '@tupaia/admin-panel';
import { getSurveysPageConfigs } from '../helpers/getSurveysPageConfigs';

export const SurveysPage = ({ getHeaderEl, translate }) => {
  const {
    SURVEY_COLUMNS,
    EXPANSION_CONFIG,
    IMPORT_CONFIG,
    DELETE_CONFIG,
    EDITOR_CONFIG,
  } = getSurveysPageConfigs(translate);

  return (
    <BaseSurveysPage
      title={translate('admin.surveys')}
      columns={SURVEY_COLUMNS}
      expansionTabs={EXPANSION_CONFIG}
      importConfig={IMPORT_CONFIG}
      getHeaderEl={getHeaderEl}
      deleteConfig={DELETE_CONFIG}
      editorConfig={EDITOR_CONFIG}
    />
  );
};

SurveysPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};
