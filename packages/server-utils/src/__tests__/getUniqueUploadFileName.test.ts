import { getUniqueUploadFileName } from '../getUniqueUploadFileName';

const GENERATED_NAME = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}(\.[a-z0-9]{1,16})?$/;

describe('getUniqueUploadFileName', () => {
  it('keeps the extension, lowercased', () => {
    expect(getUniqueUploadFileName('Entities.XLSX')).toMatch(/\.xlsx$/);
    expect(getUniqueUploadFileName('regions.geojson')).toMatch(/\.geojson$/);
  });

  it('keeps nothing else from the original name', () => {
    const fileName = getUniqueUploadFileName('Entities.xlsx');
    expect(fileName).toMatch(GENERATED_NAME);
    expect(fileName).not.toContain('Entities');
  });

  it.each([
    ['no extension', 'noext'],
    ['dotfile', '.gitignore'],
    ['non-alphanumeric extension', 'x.<script>'],
    ['extension with whitespace', 'x.xl sx'],
    ['overlong extension', `x.${'a'.repeat(17)}`],
    ['empty name', ''],
  ])('drops the extension: %s', (_description, originalName) => {
    expect(getUniqueUploadFileName(originalName)).toMatch(/^[0-9a-f-]{36}$/);
  });

  it.each(['../../etc/passwd', '..\\..\\boot.ini', 'a/../b.xlsx', '..', 'x.b/c', 'x.b\\c'])(
    'never yields path separators or traversal segments: %s',
    originalName => {
      expect(getUniqueUploadFileName(originalName)).toMatch(GENERATED_NAME);
    },
  );

  it('is unique per call', () => {
    expect(getUniqueUploadFileName('a.xlsx')).not.toBe(getUniqueUploadFileName('a.xlsx'));
  });
});
