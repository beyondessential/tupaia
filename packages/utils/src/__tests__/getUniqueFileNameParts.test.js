import { getUniqueFileNameParts } from '../getUniqueFileNameParts';

describe('getUniqueFileNameParts()', () => {
  it('splits a unique file name into its unique id and file name', () => {
    expect(getUniqueFileNameParts('abc123_Report.pdf')).toEqual({
      uniqueId: 'abc123',
      fileName: 'Report.pdf',
    });
    expect(getUniqueFileNameParts('abc123_Report_Final.pdf')).toEqual({
      uniqueId: 'abc123',
      fileName: 'Report_Final.pdf',
    });
    expect(getUniqueFileNameParts('abc123_Report Final.pdf')).toEqual({
      uniqueId: 'abc123',
      fileName: 'Report Final.pdf',
    });
    expect(getUniqueFileNameParts('abc123_Report.Final.pdf')).toEqual({
      uniqueId: 'abc123',
      fileName: 'Report.Final.pdf',
    });
    expect(() => getUniqueFileNameParts('FileName with no id.pdf')).toThrow(
      'Incorrect uniqueFileName format',
    );
  });
});
