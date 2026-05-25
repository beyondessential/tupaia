import { getCountryCode } from '@tupaia/utils';
import { ImportValidationError } from '@tupaia/utils';
import winston from 'winston';

/**
 * Resolve an xlsx sheet name to a canonical country_code.
 *
 * The new exporter emits sheet name = country_code (e.g. "KH"). The legacy
 * exporter (and older hand-authored files) emit sheet name = country_name
 * (e.g. "Cambodia"). We accept either: try code lookup first, fall back to
 * name lookup, throw an ImportValidationError if neither resolves.
 */
export const resolveSheetCountry = async (models, sheetName) => {
  if (!sheetName) {
    throw new ImportValidationError('Workbook contains a sheet with no name.');
  }

  const byCode = await models.country.findOne({ code: sheetName });
  if (byCode) return byCode.code;

  const byName = await models.country.findOne({ name: sheetName });
  if (byName) {
    winston.warn(
      `Import sheet "${sheetName}" used legacy country-name format; resolved to code ${byName.code}. ` +
        `Re-exporting will produce a code-keyed sheet name.`,
    );
    return byName.code;
  }

  // Final fallback: @tupaia/utils maps a handful of well-known names to codes
  // (Tonga, Tuvalu, etc.) even when the country row doesn't exist yet — keep
  // that behaviour so a brand-new country can still be created on first import.
  try {
    return getCountryCode(sheetName);
  } catch {
    throw new ImportValidationError(
      `Sheet "${sheetName}" does not match any country by code or name.`,
    );
  }
};
