/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { EntityList } from '../../entityMenu';
import { takeScrollControl, releaseScrollControl } from '../actions';
import { CodeGeneratorQuestion } from './CodeGeneratorQuestion';
import {
  getEntityAttributeChecker,
  getEntityBaseFilters,
  getRecentEntities,
} from '../../entityMenu/helpers';

const DumbEntityQuestion = props => {
  const { config, isOnlyQuestionOnScreen } = props;
  const shouldGenerateCode = config && config.entity && config.entity.createNew;

  return shouldGenerateCode ? (
    <CodeGeneratorQuestion {...props} />
  ) : (
    <EntityList startOpen={isOnlyQuestionOnScreen} {...props} />
  );
};

DumbEntityQuestion.propTypes = {
  config: PropTypes.object,
  isOnlyQuestionOnScreen: PropTypes.bool.isRequired,
};

DumbEntityQuestion.defaultProps = {
  config: null,
};

const mapStateToProps = (
  state,
  { id: questionId, answer: selectedEntityId, realmDatabase: database },
) => {
  const baseEntityFilters = getEntityBaseFilters(state, database, questionId);
  const recentEntities = getRecentEntities(database, state, baseEntityFilters);
  const checkEntityAttributes = getEntityAttributeChecker(state, questionId);

  return {
    baseEntityFilters,
    checkEntityAttributes,
    recentEntities,
    selectedEntityId,
  };
};

const mapDispatchToProps = (dispatch, { onChangeAnswer }) => ({
  onRowPress: entity => onChangeAnswer(entity.id),
  onClear: () => onChangeAnswer(null),
  takeScrollControl: () => dispatch(takeScrollControl()),
  releaseScrollControl: () => dispatch(releaseScrollControl()),
});

export const EntityQuestion = connect(mapStateToProps, mapDispatchToProps)(DumbEntityQuestion);
