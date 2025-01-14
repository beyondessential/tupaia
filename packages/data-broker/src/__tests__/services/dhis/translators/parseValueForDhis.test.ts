import { parseValueForDhis } from '../../../../services/dhis/translators/parseValueForDhis';

describe('parseValueForDhis()', () => {
  const numbers = [
    'INTEGER',
    'NUMBER',
    'UNIT_INTERVAL',
    'PERCENTAGE',
    'INTEGER_POSITIVE',
    'INTEGER_NEGATIVE',
    'INTEGER_ZERO_OR_POSITIVE',
  ] as const;

  const booleans = ['BOOLEAN', 'TRUE_ONLY'] as const;

  const plainText = ['TEXT', 'LONG_TEXT', 'PHONE_NUMBER', 'EMAIL'] as const;

  const unsupported = ['FILE_RESOURCE', 'LETTER', 'COORDINATE'] as const;

  numbers.forEach(type =>
    it(type, () => {
      expect(parseValueForDhis('Yes', type)).toEqual('1');
      expect(parseValueForDhis('No', type)).toEqual('0');
      expect(parseValueForDhis('5', type)).toEqual('5');
      expect(parseValueForDhis('1.1', type)).toEqual('1.1');
    }),
  );

  booleans.forEach(type =>
    it(type, () => {
      expect(parseValueForDhis('Yes', type)).toEqual('1');
      expect(parseValueForDhis('No', type)).toEqual('0');
      expect(() => parseValueForDhis('5', type)).toThrow('Unsupported boolean value');
    }),
  );

  it('DATE', () => expect(parseValueForDhis('2020-01-01', 'DATE')).toEqual('2020-01-01'));

  it('DATETIME', () =>
    expect(parseValueForDhis('2020-01-01T14:15:16', 'DATETIME')).toEqual('2020-01-01T14:15:16'));

  plainText.forEach(type => it(type, () => expect(parseValueForDhis('Hi', type)).toEqual('Hi')));

  unsupported.forEach(type =>
    it(type, () =>
      expect(() => parseValueForDhis('Anything', type)).toThrow('Unsupported data element type'),
    ),
  );
});
