/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import isPlainObject from 'lodash.isplainobject';

import { getUniqueEntries } from '@tupaia/utils';

import { contextFunctionConfigs, TransformParser } from '../transform';
import { ContextProp } from './types';

const extractContextPropsFromExpressions = (expressions: string[]) => {
  const parser = new TransformParser();
  const functions = expressions
    .filter(TransformParser.isExpression)
    .map(calcExpression => {
      return parser.getFunctions(calcExpression);
    })
    .flat();

  const contextProps = Object.entries(contextFunctionConfigs)
    .filter(([fnName]) => functions.includes(fnName))
    .map(([, config]) => config.contextProps)
    .flat();

  return getUniqueEntries(contextProps);
};

export const extractContextProps = (transform: unknown): ContextProp[] => {
  if (!Array.isArray(transform)) {
    return [];
  }

  const expressions = transform
    .map(transformStep => {
      if (typeof transformStep === 'string' || !isPlainObject(transformStep)) {
        // Skipping aliased transforms
        return undefined;
      }

      const {
        transform: transformType,
        title,
        description,
        ...restOfTransformParams
      } = transformStep;

      return Object.values(restOfTransformParams).map(param => {
        if (typeof param !== 'object') {
          return [param];
        }

        if (param === null) {
          return [];
        }

        return Object.entries(param);
      });
    })
    .flat(5)
    .filter(d => !!d);

  return extractContextPropsFromExpressions(expressions as string[]);
};
