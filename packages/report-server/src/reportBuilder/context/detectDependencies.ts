import { partition, uniq } from 'es-toolkit';
import { isPlainObject } from 'es-toolkit/compat';

import {
  contextFunctionDependencies,
  contextAliasDependencies,
  TransformParser,
} from '../transform';
import { ContextDependency } from './types';

const detectDependenciesFromExpressions = (expressions: string[]) => {
  const parser = new TransformParser();
  const functions = expressions.flatMap(calcExpression => {
    return parser.getFunctions(calcExpression);
  });

  const dependencies = Object.entries(contextFunctionDependencies)
    .filter(([fnName]) => functions.includes(fnName))
    .flatMap(([, fnDependencies]) => fnDependencies);

  return uniq(dependencies);
};

const detectDependenciesFromAliasTransforms = (aliasTransforms: string[]) => {
  const dependencies = Object.entries(contextAliasDependencies)
    .filter(([fnName]) => aliasTransforms.includes(fnName))
    .flatMap(([, aliasDependencies]) => aliasDependencies);

  return uniq(dependencies);
};

const isAliasTransform = (transformStep: unknown): transformStep is string => {
  return typeof transformStep === 'string';
};

export const detectDependencies = (transform: unknown): ContextDependency[] => {
  if (!Array.isArray(transform)) {
    return [];
  }

  const [aliasTransforms, regularTransforms] = partition(transform, isAliasTransform);

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

  return uniq([...aliasTransformDependencies, ...regularTransformDependencies]);
};
