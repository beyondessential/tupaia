import { groupBy } from 'es-toolkit/compat';

import { utcMoment } from '@tupaia/tsutils';
import { momentToPeriod, convertToPeriod } from '@tupaia/utils';

export const groupAnalyticsByPeriod = (analytics = [], periodType) =>
  analytics.reduce((results, analytic) => {
    const period = convertToPeriod(analytic.period, periodType);
    return { ...results, [period]: [...(results[period] || []), analytic] };
  }, {});

export const groupEventsByPeriod = (events = [], periodType) => {
  return events.reduce((results, event) => {
    const period = momentToPeriod(utcMoment(event.eventDate), periodType);
    return { ...results, [period]: [...(results[period] || []), event] };
  }, {});
};

export const groupEventsByOrgUnit = events => groupBy(events, 'orgUnit');
