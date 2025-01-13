import { getDeDuplicatedFileName, getUniqueFileNameParts } from '../filesystem';

describe('filesystem', () => {
  it('getUniqueFileNameParts()', () => {
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

  it('getDeDuplicatedFileName()', () => {
    expect(getDeDuplicatedFileName('Certificate.pdf', [])).toBe('Certificate.pdf');
    expect(getDeDuplicatedFileName('Certificate.pdf', ['Export.csv'])).toBe('Certificate.pdf');
    expect(getDeDuplicatedFileName('Certificate.pdf', ['Certificate.pdf', 'Export.csv'])).toBe(
      'Certificate(1).pdf',
    );
    expect(
      getDeDuplicatedFileName('Certificate.pdf', [
        'Certificate.pdf',
        'Certificate(1).pdf',
        'Export.csv',
      ]),
    ).toBe('Certificate(2).pdf');

    // Odd extensions
    expect(getDeDuplicatedFileName('Certificate', ['Certificate', 'Export.csv'])).toBe(
      'Certificate(1)',
    );
    expect(getDeDuplicatedFileName('.Certificate', ['.Certificate', 'Export.csv'])).toBe(
      '.Certificate(1)',
    );
    expect(
      getDeDuplicatedFileName('Certificate.final.pdf', ['Certificate.final.pdf', 'Export.csv']),
    ).toBe('Certificate.final(1).pdf');
  });
});
