import moment from 'moment';

// used to strip the tz suffix so that a date can be added to the database without converting to utc
// we don't want any timezone conversions when working with data_time
const ISO_DATE_FORMAT_WITHOUT_TZ = 'YYYY-MM-DDTHH:mm:ss.SSS';

/**
 * @param {*} date
 * @returns {string}
 */
export function stripTimezoneFromDate(date) {
  return moment.parseZone(date).format(ISO_DATE_FORMAT_WITHOUT_TZ);
}

const KNOWN_FORMATS_WITHOUT_TZ = [
  'YYYY-MM-DD HH:mm:ss',
  'YYYY-MM-DD HH:mm:ss.SSS',
  'YYYY-MM-DDTHH:mm:ss',
  'YYYY-MM-DDTHH:mm:ss.SSS',
];

/**
 * Given a date string e.g. "2021-01-01 00:00:00", return in our format i.e. 2021-01-01T00:00.000
 * @param date string
 * @return string|null if unable to parse format
 */
export function reformatDateStringWithoutTz(date) {
  for (const format of KNOWN_FORMATS_WITHOUT_TZ) {
    const parsed = moment(date, format, true);
    if (parsed.isValid()) {
      return parsed.format(ISO_DATE_FORMAT_WITHOUT_TZ);
    }
  }
  return null;
}
