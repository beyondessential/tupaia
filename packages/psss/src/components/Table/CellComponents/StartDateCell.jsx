import { format } from 'date-fns';

export const StartDateCell = ({ startDate }) => {
  return format(startDate, 'LLL d, yyyy');
};
