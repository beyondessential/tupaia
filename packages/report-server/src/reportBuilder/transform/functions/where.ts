import { yup } from '@tupaia/utils';

import { TransformParser } from '../parser';

type WhereParams = {
  where?: string;
};

const paramsValidator = yup.object().shape({
  where: yup.string(),
});

const where = (parser: TransformParser, params: WhereParams): boolean => {
  if (params.where === undefined) {
    return true;
  }

  const whereResult = parser.evaluate(params.where);
  if (typeof whereResult === 'boolean') {
    return whereResult;
  }
  return true;
};

const buildParams = (params: unknown): WhereParams => {
  const validatedParams = paramsValidator.validateSync(params);
  return validatedParams;
};

export const buildWhere = (params: unknown) => {
  const builtParams = buildParams(params);
  return (parser: TransformParser) => where(parser, builtParams);
};
