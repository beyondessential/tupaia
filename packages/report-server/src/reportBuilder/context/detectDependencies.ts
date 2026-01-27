import { partition, uniq } from 'es-toolkit';
import { isPlainObject } from 'es-toolkit/compat';

import { AliasTransform, Transform, ValueOf } from '@tupaia/types';
import {
  contextFunctionDependencies,
  contextAliasDependencies,
  TransformParser,
} from '../transform';
import { ContextDependency } from './types';

const detectDependenciesFromExpressions = (expressions: string[]): ContextDependency[] => {
  const parser = new TransformParser();
  const functions = expressions.flatMap(calcExpression => {
    return parser.getFunctions(calcExpression);
  });

  const dependencies = Object.entries(contextFunctionDependencies)
    .filter(([fnName]) => functions.includes(fnName))
    .flatMap(([, fnDependencies]) => fnDependencies);

  return uniq(dependencies);
};

const detectDependenciesFromAliasTransforms = (
  aliasTransforms: string[],
): ValueOf<typeof contextAliasDependencies>[number][] => {
  const dependencies = Object.entries(contextAliasDependencies)
    .filter(([fnName]) => aliasTransforms.includes(fnName))
    .flatMap(([, aliasDependencies]) => aliasDependencies);

  // Awkward cast because `contextAliasDependencies` is an empty object, so `Object.entries` will be
  // an empty array, causing `filter` call to throw TS2488. If `contextAliasDependencies` becomes
  // nonempty, this cast becomes redundant (and safe to remove).
  return uniq(dependencies) as ValueOf<typeof contextAliasDependencies>[number][];
};

const isAliasTransform = (transformStep: unknown): transformStep is AliasTransform => {
  return typeof transformStep === 'string';
};

export const detectDependencies = (transform: Transform[]): ContextDependency[] => {
  if (!Array.isArray(transform)) {
    return [];
  }

  const [aliasTransforms, regularTransforms] = partition(transform, isAliasTransform) as [
    AliasTransform[],
    Record<string, unknown>[],
  ];

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
