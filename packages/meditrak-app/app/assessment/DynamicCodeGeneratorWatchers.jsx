import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { DynamicCodeGeneratorWatcher } from './DynamicCodeGeneratorWatcher';

const hasDynamicPrefix = question =>
  question.type === 'CodeGenerator' &&
  !!question.config &&
  !!question.config.codeGenerator &&
  !!question.config.codeGenerator.dynamicPrefix;

// Keyed by the survey's startTime so each response/repeat remounts the watchers, resetting their
// refs → a repeat generates a fresh code, while within a response the tail is preserved across any
// source change.
const DynamicCodeGeneratorWatchersComponent = ({ questionIds, startTime }) => (
  <>
    {questionIds.map(questionId => (
      <DynamicCodeGeneratorWatcher key={`${startTime}:${questionId}`} questionId={questionId} />
    ))}
  </>
);

DynamicCodeGeneratorWatchersComponent.propTypes = {
  questionIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  startTime: PropTypes.string,
};

const mapStateToProps = state => ({
  startTime: state.assessment.startTime,
  questionIds: Object.values(state.assessment.questions || {})
    .filter(hasDynamicPrefix)
    .map(question => question.id),
});

export const DynamicCodeGeneratorWatchers = connect(mapStateToProps)(
  DynamicCodeGeneratorWatchersComponent,
);
