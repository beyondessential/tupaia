import moment from 'moment';

const formatDate = (date: string, format: string) => moment.parseZone(date).format(format);

export const formatDateForDHIS2 = (date: string) => formatDate(date, 'YYYY-MM-DD');
export const formatDateTimeForDHIS2 = (date: string) => formatDate(date, 'YYYY-MM-DDTHH:mm:ss');
