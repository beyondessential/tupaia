import { toArray } from '@tupaia/utils';
import { AggregationList } from '../../../types';
import { getExpressionParserInstance } from '../../../getExpressionParserInstance';
import { AggregationDescriptor, AggregationSpecs, AnalyticArithmeticConfig } from './types';

enum AggregationType {
  String, // 'SUM'
  Array, // ['SUM', 'MOST_RECENT']
  Object, // { type: 'OFFSET_PERIOD', config: { periodType: 'week' }}
  // Dictionary keys are data elements included in `AnalyticArithmeticConfig.formula`
  // or `AnalyticArithmeticConfig.parameters`
  Dictionary, // { BCD1: 'SUM', BCD2: ['COUNT', 'FINAL_EACH_WEEK' ] }
}

const getAggregationType = (aggregation: unknown): AggregationType => {
  const invalidTypeError = new Error(
    'Aggregation config must be one of (AggregationDescriptor | AggregationDescriptor[] | Object<string, AggregationDescriptor>)',
  );

  switch (typeof aggregation) {
    case 'string':
      return AggregationType.String;
    case 'object':
      if (aggregation === null) {
        throw invalidTypeError;
      }
      if (Array.isArray(aggregation)) {
        return AggregationType.Array;
      }
      if ('type' in aggregation) {
        return AggregationType.Object;
      }
      return AggregationType.Dictionary;
    default:
      throw invalidTypeError;
  }
};

const validateAggregationDescriptor = (descriptor: unknown) => {
  switch (typeof descriptor) {
    case 'string':
      if (!descriptor) {
        throw new Error('Aggregation string must not be empty');
      }
      return;
    case 'object':
      if (descriptor !== null) {
        const type = (descriptor as Record<string, unknown>)?.type;
        if (!type || typeof type !== 'string') {
          throw new Error("Aggregation object requires a non empty string as a 'type'");
        }
        return;
      }
    // fall through for `null`
    default:
      throw new Error(
        'Aggregation must be one of (AggregationDescriptor | AggregationDescriptor[])',
      );
  }
};

const validateAggregationArray = (aggregation: Array<unknown>) => {
  aggregation.forEach((descriptor, i) => {
    try {
      validateAggregationDescriptor(descriptor);
    } catch (error) {
      throw new Error(`Error in item #${i + 1}: ${(error as Error).message}`);
    }
  });
};

const validateAggregationDictionary = (
  aggregation: Record<string, unknown>,
  config: { formula: 'string'; parameters: { code: 'string' }[] },
) => {
  const { formula } = config;

  // Validate keys
  const parser = getExpressionParserInstance();
  parser.getVariables(formula).forEach(variable => {
    if (!(variable in aggregation)) {
      throw new Error(`'${variable}' is referenced in the formula but has no aggregation defined`);
    }
  });

  // Validate values
  Object.entries(aggregation).forEach(([code, aggregationSpecs]) => {
    try {
      if (Array.isArray(aggregationSpecs)) {
        validateAggregationArray(aggregationSpecs);
      } else {
        validateAggregationDescriptor(aggregationSpecs);
      }
    } catch (error) {
      throw new Error(`Error in key '${code}': ${(error as Error).message}`);
    }
  });
};

export const validateAggregation = (
  aggregation: unknown,
  config: { formula: 'string'; parameters: { code: 'string' }[] },
) => {
  switch (getAggregationType(aggregation)) {
    case AggregationType.Dictionary:
      validateAggregationDictionary(aggregation as Record<string, unknown>, config);
      break;
    case AggregationType.Array:
      validateAggregationArray(aggregation as Array<unknown>);
      break;
    default:
      validateAggregationDescriptor(aggregation);
      break;
  }
};

const descriptorToAggregation = (descriptor: AggregationDescriptor) =>
  typeof descriptor === 'object' ? descriptor : { type: descriptor };

const getAggregationDictionary = (
  config: AnalyticArithmeticConfig,
): Record<string, AggregationSpecs> => {
  const { aggregation, formula } = config;

  const aggregationType = getAggregationType(aggregation);
  if (aggregationType === AggregationType.Dictionary) {
    return aggregation as Record<string, AggregationSpecs>;
  }

  const parser = getExpressionParserInstance();
  const variables = parser.getVariables(formula);
  return Object.fromEntries(variables.map(variable => [variable, aggregation as AggregationSpecs]));
};

export const getAggregationListByCode = (
  config: AnalyticArithmeticConfig,
): Record<string, AggregationList> => {
  const aggregationDictionary = getAggregationDictionary(config);

  return Object.fromEntries(
    Object.entries(aggregationDictionary).map(([code, aggregationSpecs]) => {
      const aggregationList = toArray(aggregationSpecs).map(descriptorToAggregation);
      return [code, aggregationList];
    }),
  );
};
