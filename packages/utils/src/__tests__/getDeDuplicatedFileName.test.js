import { getDeDuplicatedFileName } from '../getDeDuplicatedFileName';

describe('getDeDuplicatedFileName()', () => {
  it('appends a number to file names that clash with existing ones', () => {
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
  });

  it('handles odd extensions', () => {
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
