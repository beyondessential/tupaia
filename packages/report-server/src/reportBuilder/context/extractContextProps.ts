/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import isPlainObject from 'lodash.isplainobject';

import { getUniqueEntries } from '@tupaia/utils';

import { contextConfig, TransformParams, TransformParser } from '../transform';
import { ContextProp } from './types';

const extractContextPropsFromExpressions = (expressions: string[]) => {
  const parser = new TransformParser();
  const functions = expressions
    .filter(parser.isCalculation)
    .map(calcExpression => {
      return parser.getFunctions(calcExpression);
    })
    .flat();

  const contextProps = Object.entries(contextConfig)
    .filter(([fnName]) => functions.includes(fnName))
    .map(([, config]) => config.contextProps)
    .flat();

  return getUniqueEntries(contextProps);
};

export const extractContextProps = (transform: unknown): ContextProp[] => {
  if (!Array.isArray(transform)) {
    return [];
  }

  const expressions = (transform as TransformParams[])
    .map(transformStep => {
      if (typeof transformStep === 'string' || !isPlainObject(transformStep)) {
        // Skipping aliased transformations
        return undefined;
      }

      const {
        transform: transformType,
        title,
        description,
        ...restOfTransformParams
      } = transformStep;

      return Object.values(restOfTransformParams).map(param => {
        return typeof param !== 'object' ? [param] : Object.entries(param);
      });
    })
    .flat(5)
    .filter(d => !!d);

  return extractContextPropsFromExpressions(expressions as string[]);
};
