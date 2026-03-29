import { useEffect, useRef } from 'react';
import { CodeGeneratorQuestionConfig } from '@tupaia/types';
import { useEntityById } from '../../../api/queries/useEntity';
import { generateShortId } from './generateId';
import { SurveyScreenComponent } from '../../../types';
import { ACTION_TYPES, SurveyFormAction } from './actions';

const TOP_LEVEL_ENTITY_FIELDS = new Set(['code', 'name', 'type']);

const resolveEntityAttribute = (
  entity: Record<string, any>,
  entityAttribute: string,
): string | undefined => {
  if (TOP_LEVEL_ENTITY_FIELDS.has(entityAttribute)) {
    return entity[entityAttribute];
  }
  return entity.attributes?.[entityAttribute];
};

interface DynamicCodeGeneratorWatcherProps {
  question: SurveyScreenComponent;
  formData: Record<string, any>;
  dispatch: React.Dispatch<SurveyFormAction>;
}

export const DynamicCodeGeneratorWatcher = ({
  question,
  formData,
  dispatch,
}: DynamicCodeGeneratorWatcherProps) => {
  const { questionId, config } = question;
  const codeGenerator = config!.codeGenerator as CodeGeneratorQuestionConfig;
  const { dynamicPrefix } = codeGenerator;
  const sourceAnswer = formData[dynamicPrefix!.questionId];

  const shouldFetchEntity = Boolean(dynamicPrefix!.entityAttribute && sourceAnswer);
  const { data: entity } = useEntityById(shouldFetchEntity ? sourceAnswer : undefined);

  const prevPrefixRef = useRef<string | undefined>(undefined);

  let resolvedPrefix: string | undefined;
  if (dynamicPrefix!.entityAttribute) {
    if (entity) {
      resolvedPrefix = resolveEntityAttribute(entity, dynamicPrefix!.entityAttribute);
    }
  } else {
    resolvedPrefix = sourceAnswer;
  }

  useEffect(() => {
    if (resolvedPrefix === undefined || resolvedPrefix === prevPrefixRef.current) return;

    prevPrefixRef.current = resolvedPrefix;

    if (codeGenerator.type !== 'shortid') {
      throw new Error(
        `dynamicPrefix is only supported with shortid code generators, got: ${codeGenerator.type}`,
      );
    }

    const newCode = generateShortId({ ...codeGenerator, prefix: resolvedPrefix });

    dispatch({
      type: ACTION_TYPES.SET_FORM_DATA,
      payload: { [questionId]: newCode },
    });
  }, [resolvedPrefix, codeGenerator, dispatch, questionId]);

  return null;
};
