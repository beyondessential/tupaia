import { filterEntities } from '../filterEntities';

describe('filterEntities', () => {
  const ENTITIES = {
    TO: { name: 'Tonga', code: 'TO', type: 'country', attributes: {} },
    LA: { name: 'Laos', code: 'LA', type: 'country', attributes: {} },
    LA_School_Primary: {
      name: 'Laos School',
      code: 'LA_School_Primary',
      type: 'school',
      attributes: { type: 'Primary' },
    },
    LA_School_Secondary1: {
      name: 'Laos School',
      code: 'LA_School_Secondary1',
      type: 'school',
      attributes: { type: 'Secondary' },
    },
    LA_School_Secondary2: {
      name: 'Laos School',
      code: 'LA_School_Secondary2',
      type: 'school',
      attributes: { type: 'Secondary' },
    },
  };
  const entityList = Object.values(ENTITIES);

  const testData = [
    ['non object field - single result', { code: 'TO' }, [ENTITIES.TO]],
    ['non object field - multiple results', { type: 'country' }, [ENTITIES.TO, ENTITIES.LA]],
    [
      'non object field - `in` operator',
      { code: { in: ['TO', 'LA_School_Primary'] } },
      [ENTITIES.TO, ENTITIES.LA_School_Primary],
    ],
    [
      'attributes field',
      { attributes: { type: 'Secondary' } },
      [ENTITIES.LA_School_Secondary1, ENTITIES.LA_School_Secondary2],
    ],
    [
      'multiple fields and operators',
      {
        name: 'Laos School',
        code: { in: ['LA_School_Primary', 'LA_School_Secondary2'] },
        type: 'school',
        attributes: { type: 'Secondary' },
      },
      [ENTITIES.LA_School_Secondary2],
    ],
    ['no match', { code: 'PG' }, []],
  ];

  it.each(testData)('%s', (_, entityFilter, expected) => {
    expect(filterEntities(entityList, entityFilter)).toStrictEqual(expected);
  });

  it('empty input', () => {
    expect(filterEntities([], { code: 'TO' })).toStrictEqual([]);
  });

  it('throws if non object filter is provided a `attributes`', () => {
    expect(() => filterEntities(entityList, { attributes: 'random' })).toThrow('expects an object');
  });
});
