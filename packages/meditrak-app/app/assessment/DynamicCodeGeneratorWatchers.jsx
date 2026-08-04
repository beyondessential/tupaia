import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { DynamicCodeGeneratorWatcher } from './DynamicCodeGeneratorWatcher';

const hasDynamicPrefix = question =>
  question.type === 'CodeGenerator' &&
  !!question.config &&
  !!question.config.codeGenerator &&
  !!question.config.codeGenerator.dynamicPrefix;

const DynamicCodeGeneratorWatchersComponent = ({ questionIds }) => (
  <>
    {questionIds.map(questionId => (
      <DynamicCodeGeneratorWatcher key={questionId} questionId={questionId} />
    ))}
  </>
);

DynamicCodeGeneratorWatchersComponent.propTypes = {
  questionIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  questionIds: Object.values(state.assessment.questions || {})
    .filter(hasDynamicPrefix)
    .map(question => question.id),
});

export const DynamicCodeGeneratorWatchers = connect(mapStateToProps)(
  DynamicCodeGeneratorWatchersComponent,
);
