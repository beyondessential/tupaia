import { paginateBySize } from '../../sync/paginateBySize';

const rows = (...sizes: number[]) => sizes.map((bytes, id) => ({ id, bytes }));
const ids = (pages: { id: number }[][]) => pages.map(page => page.map(({ id }) => id));

describe('paginateBySize', () => {
  it('fills each page up to the byte limit', () => {
    expect(ids(paginateBySize(rows(4, 4, 4, 4), 8))).toEqual([
      [0, 1],
      [2, 3],
    ]);
  });

  it('gives a row bigger than the limit a page of its own', () => {
    expect(ids(paginateBySize(rows(1, 20, 1), 8))).toEqual([[0], [1], [2]]);
  });

  it('lets small rows share a page with a big one up to the limit', () => {
    // As with 3 MB photos and small text answers under a 5 MB limit
    expect(ids(paginateBySize(rows(1, 3, 3, 1), 5))).toEqual([
      [0, 1],
      [2, 3],
    ]);
  });

  it('also limits the number of rows', () => {
    expect(ids(paginateBySize(rows(1, 1, 1), 100, 2))).toEqual([[0, 1], [2]]);
  });

  it('has no pages for no rows', () => {
    expect(paginateBySize([], 8)).toEqual([]);
  });
});
