/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import isPlainObject from 'lodash.isplainobject';

import { getUniqueEntries } from '@tupaia/utils';

import {
  contextFunctionDependencies,
  contextAliasDependencies,
  TransformParser,
} from '../transform';
import { ContextDependency } from './types';

const detectDependenciesFromExpressions = (expressions: string[]) => {
  const parser = new TransformParser();
  const functions = expressions
    .map(calcExpression => {
      return parser.getFunctions(calcExpression);
    })
    .flat();

  const dependencies = Object.entries(contextFunctionDependencies)
    .filter(([fnName]) => functions.includes(fnName))
    .map(([, fnDependencies]) => fnDependencies)
    .flat();

  return getUniqueEntries(dependencies);
};

const detectDependenciesFromAliasTransforms = (aliasTransforms: string[]) => {
  const dependencies = Object.entries(contextAliasDependencies)
    .filter(([fnName]) => aliasTransforms.includes(fnName))
    .map(([, aliasDependencies]) => aliasDependencies)
    .flat();

  return getUniqueEntries(dependencies);
};

const isAliasTransform = (transformStep: unknown): transformStep is string => {
  return typeof transformStep === 'string';
};

export const detectDependencies = (transform: unknown): ContextDependency[] => {
  if (!Array.isArray(transform)) {
    return [];
  }

  const aliasTransforms = transform.filter(isAliasTransform);

  const regularTransforms = transform.filter(transformStep => !isAliasTransform(transformStep));

  const expressions = regularTransforms
    .map(transformStep => {
      if (!isPlainObject(transformStep)) {
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
    .filter(d => !!d)
    .filter(TransformParser.isExpression);

  const aliasTransformDependencies = detectDependenciesFromAliasTransforms(aliasTransforms);
  const regularTransformDependencies = detectDependenciesFromExpressions(expressions as string[]);

  return getUniqueEntries([...aliasTransformDependencies, ...regularTransformDependencies]);
};
