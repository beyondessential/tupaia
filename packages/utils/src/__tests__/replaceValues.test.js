import { replaceValues } from '../replaceValues';

describe('replaceValues()', () => {
  const testData = [
    ['undefined replacement values', ['{target}', undefined], '{target}'],
    ['null replacement values', ['{target}', null], '{target}'],
    ['empty replacement values', ['{target}', {}], '{target}'],
    ['no matching replacement value', ['{target}', { other: 'replaced' }], '{target}'],
    ['string input', ['{target}', { target: 'replaced' }], 'replaced'],
    ['key replacement', [{ '{target}': 'value' }, { target: 'replaced' }], { replaced: 'value' }],
    ['value replacement', [{ key: '{target}' }, { target: 'replaced' }], { key: 'replaced' }],
    [
      'key and value replacement',
      [
        { '{targetKey}': '{targetValue}' },
        { targetKey: 'replacedKey', targetValue: 'replacedValue' },
      ],
      { replacedKey: 'replacedValue' },
    ],
  ];

  it.each(testData)('%s', (_, [target, replacements], expected) => {
    expect(replaceValues(target, replacements)).toStrictEqual(expected);
  });
});
