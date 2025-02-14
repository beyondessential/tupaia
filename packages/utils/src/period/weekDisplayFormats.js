export const WEEK_DISPLAY_FORMATS = {
  WEEK_COMMENCING_ABBR: 'WEEK_COMMENCING_ABBR',
  WEEK_COMMENCING: 'WEEK_COMMENCING',
  WEEK_ENDING_ABBR: 'WEEK_ENDING_ABBR',
  WEEK_ENDING: 'WEEK_ENDING',
  ISO_WEEK_NUMBER: 'ISO_WEEK_NUMBER',
};

// Note on first day of week: we use startOf('week') / endOf('week') which is locale-aware of the
// user's browser to decide if that is Monday or Sunday
export const WEEK_DISPLAY_CONFIG = {
  [WEEK_DISPLAY_FORMATS.WEEK_COMMENCING_ABBR]: {
    chartFormat: 'D MMM YYYY',
    rangeFormat: '[W/C] D MMM YYYY',
    pickerFormat: '[W/C] D MMM YYYY',
    urlFormat: '[Week_Starting]_D_MMM_YYYY',
    modifier: 'startOfWeek',
  },
  [WEEK_DISPLAY_FORMATS.WEEK_COMMENCING]: {
    chartFormat: 'D MMM YYYY',
    rangeFormat: '[Week Commencing] D MMM YYYY',
    pickerFormat: '[Week Commencing] D MMM YYYY',
    urlFormat: '[Week_Starting]_D_MMM_YYYY',
    modifier: 'startOfWeek',
  },
  [WEEK_DISPLAY_FORMATS.WEEK_ENDING_ABBR]: {
    chartFormat: 'D MMM YYYY',
    rangeFormat: '[W/E] D MMM YYYY',
    pickerFormat: '[W/E] D MMM YYYY',
    urlFormat: '[Week_Ending]_D_MMM_YYYY',
    modifier: 'endOfWeek',
  },
  [WEEK_DISPLAY_FORMATS.WEEK_ENDING]: {
    chartFormat: 'D MMM YYYY',
    rangeFormat: '[Week Ending] D MMM YYYY',
    pickerFormat: '[Week Ending] D MMM YYYY',
    urlFormat: '[Week_Ending]_D_MMM_YYYY',
    modifier: 'endOfWeek',
  },
  [WEEK_DISPLAY_FORMATS.ISO_WEEK_NUMBER]: {
    chartFormat: '[ISO Week] W YYYY',
    rangeFormat: '[ISO Week] W YYYY',
    pickerFormat: '[ISO Week] W YYYY',
    urlFormat: '[ISO_Week]_W_YYYY',
  },
};
