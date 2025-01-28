export const displayDate = (date?: Date | null, localeCode?: string) => {
  if (!date) {
    return '';
  }
  return new Date(date).toLocaleDateString(localeCode);
};

export const displayDateTime = (date?: Date | null, locale?: string) => {
  if (!date) {
    return '';
  }

  return new Date(date)
    .toLocaleString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
    .replace(',', ' ');
};
