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

/**
 * Determine the code to use given the current prefix and state.
 * Returns the code string and the trailing (random) portion for reuse across prefix changes.
 */
const resolveCode = ({
  resolvedPrefix,
  existingCode,
  trailingCode,
  codeGenerator,
}: {
  resolvedPrefix: string;
  existingCode: string | undefined;
  trailingCode: string | undefined;
  codeGenerator: CodeGeneratorQuestionConfig;
}): { code: string; trailingCode: string } => {
  if (codeGenerator.type !== 'shortid') {
    throw new Error(
      `dynamicPrefix is only supported with shortid code generators, got: ${codeGenerator.type}`,
    );
  }

  // Draft/existing code matches the current prefix — preserve it
  if (existingCode && existingCode.startsWith(`${resolvedPrefix}-`)) {
    return { code: existingCode, trailingCode: extractTrailingCode(existingCode, resolvedPrefix) };
  }

  // Prefix changed but trailing code already exists — swap the prefix
  if (trailingCode) {
    return { code: `${resolvedPrefix}-${trailingCode}`, trailingCode };
  }

  // First generation — create a full new code
  const newCode = generateShortId({ ...codeGenerator, prefix: resolvedPrefix });
  return { code: newCode, trailingCode: extractTrailingCode(newCode, resolvedPrefix) };
};

const useResolvedPrefix = (
  dynamicPrefix: NonNullable<CodeGeneratorQuestionConfig['dynamicPrefix']>,
  isEntitySource: boolean,
  sourceAnswer: string | undefined,
): string | undefined => {
  const shouldFetchEntity = Boolean(isEntitySource && sourceAnswer);
  const { data: entity } = useEntityById(shouldFetchEntity ? sourceAnswer : undefined);

  if (isEntitySource) {
    return entity ? resolvePrefix(entity, dynamicPrefix) : undefined;
  }
  return sourceAnswer;
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
  const resolvedPrefix = useResolvedPrefix(dynamicPrefix!, isEntitySource, sourceAnswer);

  const prevPrefixRef = useRef<string | undefined>(undefined);
  const trailingCodeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isResponseScreen) return;

    if (resolvedPrefix === undefined) {
      if (prevPrefixRef.current !== undefined) {
        prevPrefixRef.current = undefined;
        dispatch({
          type: ACTION_TYPES.SET_FORM_DATA,
          payload: { [questionId]: undefined },
        });
      }
      return;
    }

    if (resolvedPrefix === prevPrefixRef.current) return;

    prevPrefixRef.current = resolvedPrefix;

    const result = resolveCode({
      resolvedPrefix,
      existingCode: formData[questionId],
      trailingCode: trailingCodeRef.current,
      codeGenerator,
    });

    trailingCodeRef.current = result.trailingCode;

    if (result.code !== formData[questionId]) {
      dispatch({
        type: ACTION_TYPES.SET_FORM_DATA,
        payload: { [questionId]: result.code },
      });
    }
  }, [resolvedPrefix, codeGenerator, dispatch, questionId, isResponseScreen]);

  return null;
};
