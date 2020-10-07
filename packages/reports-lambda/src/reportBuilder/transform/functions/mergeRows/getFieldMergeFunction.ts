import { mergeFunctions } from './mergeFunctions';
import { parseToken } from '../../../functions';
import { Row } from '../../../reportBuilder';

export const buildGetFieldMergeFunction = (
  params: { [functionName: string]: string[] },
  defaultMergeFunction?: string,
) => {
  if (Object.keys(params).find(key => !(key in mergeFunctions))) {
    throw new Error(`Expected all keys to be merge function`);
  }

  if (defaultMergeFunction !== undefined && !(defaultMergeFunction in mergeFunctions)) {
    throw new Error(`Expected default to be merge function but got ${defaultMergeFunction}`);
  }

  return (row: Row, field: string): keyof typeof mergeFunctions => {
    const matching = Object.entries(params).find(([functionName, fieldsToApplyTo]) =>
      fieldsToApplyTo.map(fieldToApply => parseToken(row, fieldToApply)).includes(field),
    );
    if (matching !== undefined) {
      if (matching[0] in mergeFunctions) {
        return matching[0] as keyof typeof mergeFunctions;
      } else {
        throw new Error(`Expected key to be merge function but got ${matching[0]}`);
      }
    }
    return defaultMergeFunction ? (defaultMergeFunction as keyof typeof mergeFunctions) : 'default';
  };
};
