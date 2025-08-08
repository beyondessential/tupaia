import { yup } from '@tupaia/utils';
import { yupTsUtils } from '@tupaia/tsutils';
import { TransformParser } from '../../parser';

export const fieldValueValidator = yupTsUtils.describableLazy(
  (value: unknown) => {
    if (typeof value === 'string') {
      return yup.string();
    }

    if (typeof value === 'number') {
      return yup.number();
    }

    if (typeof value === 'boolean') {
      return yup.bool();
    }

    return yup.string();
  },
  [yup.string(), yup.number(), yup.bool()],
);

export const starSingleOrMultipleColumnsValidator = yupTsUtils.describableLazy(
  (value: unknown) => {
    if (typeof value === 'string' || value === undefined) {
      return yup.string();
    }

    if (Array.isArray(value)) {
      return yup.array().of(yup.string().required());
    }

    throw new yup.ValidationError(
      "Input must be either '*', a single column, or an array of columns",
    );
  },
  [yup.string(), yup.array().of(yup.string().required())],
);

export const gatherColumnsValidator = yupTsUtils.describableLazy(
  (value: unknown) => {
    if (typeof value === 'string') {
      return yup.string().required().notOneOf(['value', 'columnName']);
    }

    if (Array.isArray(value) || value === undefined) {
      return yup.array().of(yup.string().required());
    }

    throw new yup.ValidationError('Input must be empty, a single column, or an array of columns');
  },
  [
    yup.string().required().notOneOf(['value', 'columnName']),
    yup.array().of(yup.string().required()),
  ],
);

export const mapStringToStringValidator = yupTsUtils.describableLazy(
  (value: unknown) => {
    if ((typeof value === 'object' && value !== null) || value === undefined) {
      const stringToStringMapValidator = Object.fromEntries(
        Object.entries(value || {}).map(([field]) => [field, yup.string().required()]),
      );
      return yup.object().shape(stringToStringMapValidator).notRequired();
    }

    throw new yup.ValidationError('Input must be a string to string mapping');
  },
  [yup.object()],
);

export const expressionOrArrayValidator = yupTsUtils.describableLazy(
  (value: unknown) => {
    if (TransformParser.isExpression(value)) {
      return yup.string().required();
    }

    if (Array.isArray(value)) {
      return yup.array(fieldValueValidator).required();
    }

    throw new yup.ValidationError('Input must be an expression or an array');
  },
  [yup.string().required(), yup.array(fieldValueValidator).required()],
);

export const ascOrDescValidator = yup.mixed<'asc' | 'desc'>().oneOf(['asc', 'desc']);
