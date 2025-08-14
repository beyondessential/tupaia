import { http, HttpResponse } from 'msw';
import entity from './mockData/entity.json';
import dashboards from './mockData/dashboards.json';
import reports from './mockData/reports.json';

export const handlers = [
  http.get('*/v1/entity/test/test', () => {
    return HttpResponse.json(entity);
  }),
  http.get('*/v1/dashboards/test/test', () => {
    return HttpResponse.json(dashboards);
  }),
  http.get('*/v1/report/:reportId', ({ params }) => {
    const { reportId } = params;
    const report = reports[reportId];
    if (!report) {
      console.warn(`No report found for id ${reportId}`);
    }
    return HttpResponse.json(report);
  }),
];
