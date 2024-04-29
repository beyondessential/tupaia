/**
 * Tupaia MediTrak
 * Copyright (c) 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { QuestionsPage as BaseQuestionsPage } from '@tupaia/admin-panel';
import { getQuestionPageConfigs } from '../helpers/getQuestionPageConfigs';

export const QuestionsPage = ({ translate }) => {
  const { QUESTION_COLUMNS, EXPANSION_CONFIG, EDITOR_CONFIG } = getQuestionPageConfigs(translate);

  return (
    <BaseQuestionsPage
      title={translate('admin.questions')}
      endpoint="questions"
      columns={QUESTION_COLUMNS}
      expansionTabs={EXPANSION_CONFIG}
      editorConfig={EDITOR_CONFIG}
    />
  );
};

QuestionsPage.propTypes = {
  translate: PropTypes.func.isRequired,
};
