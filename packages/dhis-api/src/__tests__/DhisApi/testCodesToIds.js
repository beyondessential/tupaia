import { when } from 'jest-when';
import { createDhisApi } from './helpers';

const DATA_ELEMENTS = [
  { code: 'POP01', id: 'pop01_dhisId' },
  { code: 'POP02', id: 'pop02_dhisId' },
];

export const testCodesToIds = () => {
  it('should return an empty array if no codes are provided', async () => {
    const dhisApi = createDhisApi();

    for (const codes of [undefined, null, []]) {
      await expect(dhisApi.codesToIds('dataElements', codes)).resolves.toStrictEqual([]);
    }
  });

  it('should translate codes to ids', async () => {
    const codes = DATA_ELEMENTS.map(({ code }) => code);
    const ids = DATA_ELEMENTS.map(({ id }) => id);
    const fetchStub = jest.fn();
    when(fetchStub)
      .calledWith(
        'dataElements',
        {
          fields: expect.arrayContaining(['id']),
          filter: { comparator: 'in', code: expect.toBeOneOf(['[POP01,POP02]', '[POP02,POP01]']) },
        },
        undefined,
      )
      .mockResolvedValue({ dataElements: DATA_ELEMENTS.map(({ id, code }) => ({ id, code })) });

    const dhisApi = createDhisApi({ fetch: fetchStub });
    const results = await dhisApi.codesToIds('dataElements', codes);
    expect(results).toStrictEqual(ids);
  });
};
