import { useEffect, useRef } from 'react';
import { CodeGeneratorQuestionConfig } from '@tupaia/types';
import { useEntityById } from '../../../api/queries/useEntity';
import { generateShortId } from './generateId';
import { SurveyScreenComponent } from '../../../types';
import { ACTION_TYPES, SurveyFormAction } from './actions';

const resolvePrefix = (
  entity: Record<string, any>,
  dynamicPrefix: NonNullable<CodeGeneratorQuestionConfig['dynamicPrefix']>,
): string | undefined => {
  const { entityField, entityAttribute } = dynamicPrefix;
  if (entityField) return entity[entityField];
  if (entityAttribute) return entity.attributes?.[entityAttribute];
  return entity.name;
};

/**
 * Extract the trailing code (the random part after the prefix) from a generated code string.
 * e.g. "EBN-HM8-Z1N-CJV0" → "HM8-Z1N-CJV0"
 */
const extractTrailingCode = (code: string, prefix: string): string => {
  const expectedPrefix = `${prefix}-`;
  if (!code.startsWith(expectedPrefix)) {
    throw new Error(
      `Generated code "${code}" does not start with expected prefix "${expectedPrefix}"`,
    );
  }
  return code.slice(expectedPrefix.length);
};

interface DynamicCodeGeneratorWatcherProps {
  question: SurveyScreenComponent;
  isEntitySource: boolean;
  formData: Record<string, any>;
  dispatch: React.Dispatch<SurveyFormAction>;
  isResponseScreen: boolean;
}

export const DynamicCodeGeneratorWatcher = ({
  question,
  isEntitySource,
  formData,
  dispatch,
  isResponseScreen,
}: DynamicCodeGeneratorWatcherProps) => {
  const { questionId, config } = question;
  const codeGenerator = config!.codeGenerator as CodeGeneratorQuestionConfig;
  const { dynamicPrefix } = codeGenerator;
  const sourceAnswer = formData[dynamicPrefix!.questionId];

  // Fetch entity if the source question is an entity question and has an answer
  const shouldFetchEntity = Boolean(isEntitySource && sourceAnswer);
  const { data: entity } = useEntityById(shouldFetchEntity ? sourceAnswer : undefined);

  const prevPrefixRef = useRef<string | undefined>(undefined);
  const trailingCodeRef = useRef<string | undefined>(undefined);

  let resolvedPrefix: string | undefined;
  if (isEntitySource) {
    if (entity) {
      resolvedPrefix = resolvePrefix(entity, dynamicPrefix!);
    }
  } else {
    resolvedPrefix = sourceAnswer;
  }

  useEffect(() => {
    // Don't overwrite saved answers when viewing a submitted response
    if (isResponseScreen) return;

    if (resolvedPrefix === undefined) {
      // If a code was previously generated and the prefix is now undefined (e.g. entity
      // changed to one without the required attribute), clear the code
      if (prevPrefixRef.current !== undefined) {
        prevPrefixRef.current = undefined;
        trailingCodeRef.current = undefined;
        dispatch({
          type: ACTION_TYPES.SET_FORM_DATA,
          payload: { [questionId]: undefined },
        });
      }
      return;
    }

    if (resolvedPrefix === prevPrefixRef.current) return;

    if (codeGenerator.type !== 'shortid') {
      throw new Error(
        `dynamicPrefix is only supported with shortid code generators, got: ${codeGenerator.type}`,
      );
    }

    prevPrefixRef.current = resolvedPrefix;

    let newCode: string;
    if (trailingCodeRef.current) {
      // Prefix changed but trailing code already exists — just swap the prefix
      newCode = `${resolvedPrefix}-${trailingCodeRef.current}`;
    } else {
      // First generation — create a full new code
      newCode = generateShortId({ ...codeGenerator, prefix: resolvedPrefix });
      trailingCodeRef.current = extractTrailingCode(newCode, resolvedPrefix);
    }

    dispatch({
      type: ACTION_TYPES.SET_FORM_DATA,
      payload: { [questionId]: newCode },
    });
  }, [resolvedPrefix, codeGenerator, dispatch, questionId, isResponseScreen]);

  return null;
};
