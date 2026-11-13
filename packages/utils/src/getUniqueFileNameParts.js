/**
 * "Unique Filenames" e.g. "5da02ed278d10e8695530688_Report.pdf" are used to be able to work with uploaded files without
 * worrying about name clashes. The actual fileName is prefixed with a unique string. The delimiter is '_'.
 *
 * @param uniqueFileName
 * @return {{fileName: string, uniqueId: string}}
 */
export const getUniqueFileNameParts = uniqueFileName => {
  const indexOfFirstUnderscore = uniqueFileName.indexOf('_');
  if (indexOfFirstUnderscore === -1) throw new Error('Incorrect uniqueFileName format');
  return {
    uniqueId: uniqueFileName.substring(0, indexOfFirstUnderscore), // the "5da02ed278d10e8695530688" part of "5da02ed278d10e8695530688_Report.pdf"
    fileName: uniqueFileName.substring(indexOfFirstUnderscore + 1), // the "Report.pdf" part of "5da02ed278d10e8695530688_Report.pdf"
  };
};
