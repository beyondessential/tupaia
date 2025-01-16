import { Context } from '../../context';
import { buildTransform } from '..';

export const convertPeriodToWeek = (context: Context) =>
  buildTransform(
    [
      {
        transform: 'updateColumns',
        insert: {
          period: "=convertToPeriod($period, 'WEEK')",
        },
        include: '*',
      },
    ],
    context,
  );

export const convertEventDateToWeek = (context: Context) =>
  buildTransform(
    [
      {
        transform: 'updateColumns',
        insert: {
          period: "=convertToPeriod($eventDate, 'WEEK')",
        },
        include: '*',
      },
    ],
    context,
  );
