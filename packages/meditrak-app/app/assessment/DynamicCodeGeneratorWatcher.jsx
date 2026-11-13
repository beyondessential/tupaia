import { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { database } from '../database';
import { changeAnswer } from './actions';
import { getAnswerForQuestion, getQuestion } from './selectors';
import { resolveCode, resolvePrefix } from './specificQuestions/utilities/dynamicCodeGenerator';

const ENTITY_QUESTION_TYPES = ['Entity', 'PrimaryEntity'];

// Read an entity's prefix-relevant fields straight off the Realm record. We avoid Entity.toJson()
// because it dereferences the (optional) parent and throws for parentless entities.
const getEntityRecord = entityId => {
  if (!entityId) return null;
  const entity = database.findOne('Entity', entityId);
  if (!entity) return null;
  return {
    name: entity.name,
    code: entity.code,
    type: entity.type,
    attributes: entity.attributes ? JSON.parse(entity.attributes) : {},
  };
};

const resolveDynamicPrefix = (dynamicPrefix, isEntitySource, sourceAnswer) => {
  if (!sourceAnswer) return undefined;
  if (isEntitySource) {
    const entity = getEntityRecord(sourceAnswer);
    const prefix = entity ? resolvePrefix(entity, dynamicPrefix) : undefined;
    // Realm optional fields (e.g. entity.code) and empty attribute values come back as null/'';
    // treat those as "no prefix" (shows the warning) rather than crashing in generateShortId.
    return prefix || undefined;
  }
  return sourceAnswer;
};

/**
 * Headless watcher (one per dynamic-prefix CodeGenerator question) that keeps the generated code in
 * sync with its source answer. Mounted at the assessment level so it survives screen navigation,
 * letting it reuse the random tail of the code across prefix changes.
 */
const DynamicCodeGeneratorWatcherComponent = ({
  questionId,
  codeGenerator,
  resolvedPrefix,
  existingCode,
  dispatch,
}) => {
  const prevPrefixRef = useRef(undefined);
  const trailingCodeRef = useRef(undefined);

  useEffect(() => {
    if (resolvedPrefix === undefined) {
      if (prevPrefixRef.current !== undefined) {
        prevPrefixRef.current = undefined;
        dispatch(changeAnswer(questionId, undefined));
      }
      return;
    }

    if (resolvedPrefix === prevPrefixRef.current) return;
    prevPrefixRef.current = resolvedPrefix;

    const result = resolveCode({
      resolvedPrefix,
      existingCode,
      trailingCode: trailingCodeRef.current,
      codeGenerator,
    });
    trailingCodeRef.current = result.trailingCode;

    if (result.code !== existingCode) {
      dispatch(changeAnswer(questionId, result.code));
    }
  }, [resolvedPrefix, existingCode, codeGenerator, questionId, dispatch]);

  return null;
};

DynamicCodeGeneratorWatcherComponent.propTypes = {
  questionId: PropTypes.string.isRequired,
  codeGenerator: PropTypes.object.isRequired,
  resolvedPrefix: PropTypes.string,
  existingCode: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { questionId }) => {
  const { config } = getQuestion(state, questionId);
  const { codeGenerator } = config;
  const { dynamicPrefix } = codeGenerator;

  const sourceQuestion = getQuestion(state, dynamicPrefix.questionId);
  const isEntitySource = !!sourceQuestion && ENTITY_QUESTION_TYPES.includes(sourceQuestion.type);
  const sourceAnswer = getAnswerForQuestion(state, dynamicPrefix.questionId);

  return {
    codeGenerator,
    resolvedPrefix: resolveDynamicPrefix(dynamicPrefix, isEntitySource, sourceAnswer),
    existingCode: getAnswerForQuestion(state, questionId),
  };
};

export const DynamicCodeGeneratorWatcher = connect(mapStateToProps)(
  DynamicCodeGeneratorWatcherComponent,
);
