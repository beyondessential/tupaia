import { generateShortId } from '../../../../utilities';
import { extractTrailingCode, resolveCode, resolvePrefix } from '../dynamicCodeGenerator';

// Mock the utilities barrel so we don't pull nanoid / native modules into the unit test, and so
// first-generation is deterministic. (jest.mock is hoisted above the imports by babel-jest.)
jest.mock('../../../../utilities', () => ({
  SHORT_ID: 'shortid',
  generateShortId: jest.fn(({ codeGenerator }) => {
    const { prefix } = codeGenerator;
    return prefix ? `${prefix}-AAA-BBB-CCCC` : 'AAA-BBB-CCCC';
  }),
}));

describe('resolvePrefix', () => {
  const entity = {
    name: 'East New Britain',
    code: 'EBN',
    type: 'district',
    attributes: { facility_level: 'L3', code_prefix: 'EBN' },
  };

  it('uses a top-level entity field when entityField is set', () => {
    expect(resolvePrefix(entity, { entityField: 'code' })).toBe('EBN');
    expect(resolvePrefix(entity, { entityField: 'type' })).toBe('district');
  });

  it('uses an entity attribute when entityAttribute is set', () => {
    expect(resolvePrefix(entity, { entityAttribute: 'facility_level' })).toBe('L3');
  });

  it('defaults to the entity name when neither field nor attribute is set', () => {
    expect(resolvePrefix(entity, {})).toBe('East New Britain');
  });

  it('returns undefined when the requested attribute is missing', () => {
    expect(resolvePrefix(entity, { entityAttribute: 'missing_attribute' })).toBeUndefined();
    expect(resolvePrefix({ name: 'x' }, { entityAttribute: 'anything' })).toBeUndefined();
  });
});

describe('extractTrailingCode', () => {
  it('strips the prefix and separator', () => {
    expect(extractTrailingCode('EBN-HM8-Z1N-CJV0', 'EBN')).toBe('HM8-Z1N-CJV0');
  });

  it('throws when the code does not start with the prefix', () => {
    expect(() => extractTrailingCode('CEN-HM8-Z1N-CJV0', 'EBN')).toThrow();
  });
});

describe('resolveCode', () => {
  const codeGenerator = { type: 'shortid' };

  beforeEach(() => {
    generateShortId.mockClear();
  });

  it('keeps an existing code that already matches the prefix', () => {
    const result = resolveCode({
      resolvedPrefix: 'EBN',
      existingCode: 'EBN-HM8-Z1N-CJV0',
      trailingCode: undefined,
      codeGenerator,
    });
    expect(result.code).toBe('EBN-HM8-Z1N-CJV0');
    expect(result.trailingCode).toBe('HM8-Z1N-CJV0');
    expect(generateShortId).not.toHaveBeenCalled();
  });

  it('swaps the prefix but reuses the trailing code when the prefix changes', () => {
    const result = resolveCode({
      resolvedPrefix: 'CEN',
      existingCode: 'EBN-HM8-Z1N-CJV0',
      trailingCode: 'HM8-Z1N-CJV0',
      codeGenerator,
    });
    expect(result.code).toBe('CEN-HM8-Z1N-CJV0');
    expect(result.trailingCode).toBe('HM8-Z1N-CJV0');
    expect(generateShortId).not.toHaveBeenCalled();
  });

  it('generates a whole new code on first generation', () => {
    const result = resolveCode({
      resolvedPrefix: 'NEW',
      existingCode: undefined,
      trailingCode: undefined,
      codeGenerator,
    });
    expect(result.code).toBe('NEW-AAA-BBB-CCCC');
    expect(result.trailingCode).toBe('AAA-BBB-CCCC');
    expect(generateShortId).toHaveBeenCalledWith({
      codeGenerator: { type: 'shortid', prefix: 'NEW' },
    });
  });

  it('throws for non-shortid code generators', () => {
    expect(() =>
      resolveCode({
        resolvedPrefix: 'NEW',
        existingCode: undefined,
        trailingCode: undefined,
        codeGenerator: { type: 'mongoid' },
      }),
    ).toThrow();
  });
});
