import { removeDiacritics } from '../removeDiacritics';

describe('removeDiacritics', () => {
  it('returns the input string when there are no diacritics', () => {
    expect(removeDiacritics('hello world')).toBe('hello world');
  });

  it('removes diacritics from accented characters', () => {
    expect(removeDiacritics('açaí')).toBe('acai');
    expect(removeDiacritics('café')).toBe('cafe');
    expect(removeDiacritics('crème brûlée')).toBe('creme brulee');
    expect(removeDiacritics('España')).toBe('Espana');
    expect(removeDiacritics('İzmir')).toBe('Izmir');
    expect(removeDiacritics('mānuka')).toBe('manuka');
    expect(removeDiacritics('naïve')).toBe('naive');
    expect(removeDiacritics('résumé')).toBe('resume');
    expect(removeDiacritics('San José')).toBe('San Jose');
    expect(removeDiacritics('São Paulo')).toBe('Sao Paulo');
    expect(removeDiacritics('Świętokrzyskie Province')).toBe('Swietokrzyskie Province');
    expect(removeDiacritics('Waitematā')).toBe('Waitemata');
    expect(removeDiacritics('Zürich')).toBe('Zurich');
    // ʻOkinas represented with U+02BB modifier letter turned comma
    expect(removeDiacritics('ʻŌmaʻo')).toBe('Omao');
  });

  it('does not change casing', () => {
    expect(removeDiacritics('CAFÉ')).toBe('CAFE');
    expect(removeDiacritics('Naïve')).toBe('Naive');
    expect(removeDiacritics('zÜrIcH')).toBe('zUrIcH');
  });

  it('leaves whitespace untouched', () => {
    expect(removeDiacritics(' word spaces ')).toBe(' word spaces ');
    expect(removeDiacritics('\ttab\tcharacters\t')).toBe('\ttab\tcharacters\t');
    expect(removeDiacritics('\nnew\nlines\n')).toBe('\nnew\nlines\n');
    expect(removeDiacritics('c a f é')).toBe('c a f e');
  });

  it('leaves punctuation untouched', () => {
    expect(removeDiacritics('Fort-Liberté')).toBe('Fort-Liberte');
    expect(removeDiacritics('Hello, world!')).toBe('Hello, world!');

    // ʻOkinas in “Hawaii” and “Oahu”, with possessive apostrophe in “Oahu’s”
    expect(removeDiacritics('Hawaiʻi Oʻahu’s')).toBe('Hawaii Oahu’s');
  });
});
