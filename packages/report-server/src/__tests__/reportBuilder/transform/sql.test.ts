import { TransformTable } from '../../../reportBuilder/transform';
import { buildTestTransform } from '../testUtils';

describe('sql', () => {
  it('can perform an SQL query against the table', async () => {
    const transform = buildTestTransform([
      {
        transform: 'sql',
        sql: 'SELECT owner, sum(cat) as cat, max(dog) as dog FROM transform_table GROUP BY owner',
      },
    ]);
    expect(
      await transform(
        TransformTable.fromRows([
          { owner: 'jim', cat: 1, dog: 2 },
          { owner: 'jim', cat: 3, dog: 4 },
          { owner: 'doug', cat: 2, dog: 1 },
          { owner: 'claire', cat: 7, dog: 2 },
        ]),
      ),
    ).toStrictEqual(
      TransformTable.fromRows([
        { owner: 'jim', cat: 4, dog: 4 },
        { owner: 'doug', cat: 2, dog: 1 },
        { owner: 'claire', cat: 7, dog: 2 },
      ]),
    );
  });
});
