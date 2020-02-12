import groupBy from 'lodash.groupby';

import { utcMoment } from '@tupaia/utils';
import { momentToPeriod, convertToPeriod } from './periodTypes';

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
