/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { EntityList } from '../../entityMenu';
import { takeScrollControl, releaseScrollControl } from '../actions';
import { loadEntitiesFromDatabase } from '../../entityMenu/actions';
import { getEntityQuestionState } from '../selectors';
import { CodeGeneratorQuestion } from './CodeGeneratorQuestion';

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

// This is presented as a question, but instead of tracking its answer it just
// speaks directly to redux and is sent as part of the metadata of the request.
export const PrimaryEntityQuestion = connect(
  (state, { id: questionId, answer: selectedEntityId }) => {
    const { entities = [], recentEntities = [] } = getEntityQuestionState(state, questionId);

    return {
      entities,
      recentEntities,
      selectedEntityId,
      hasScrollControl: state.assessment.isChildScrolling,
    };
  },
  (dispatch, { id: questionId, onChangeAnswer }) => ({
    onMount: () => dispatch(loadEntitiesFromDatabase(true, questionId)),
    onRowPress: entity => onChangeAnswer(entity.id),
    onClear: () => onChangeAnswer(null),
    takeScrollControl: () => dispatch(takeScrollControl()),
    releaseScrollControl: () => dispatch(releaseScrollControl()),
  }),
)(DumbEntityQuestion);

export const EntityQuestion = connect(
  (state, { id: questionId, answer: selectedEntityId }) => {
    const { entities } = getEntityQuestionState(state, questionId);

    return {
      entities,
      selectedEntityId,
    };
  },
  (dispatch, { id: questionId, onChangeAnswer }) => ({
    onMount: () => dispatch(loadEntitiesFromDatabase(false, questionId)),
    onRowPress: entity => onChangeAnswer(entity.id),
    onClear: () => onChangeAnswer(null),
    takeScrollControl: () => dispatch(takeScrollControl()),
    releaseScrollControl: () => dispatch(releaseScrollControl()),
  }),
)(DumbEntityQuestion);
