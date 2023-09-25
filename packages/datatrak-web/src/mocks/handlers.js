import { rest } from 'msw';
import survey from './mockData/survey';
import surveyScreenComponents from './mockData/surveyScreenComponents';
export const handlers = [
  rest.get('*/v1/surveys/test/surveyScreenComponents', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(surveyScreenComponents));
  }),

  rest.get('*/v1/surveys/test', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(survey));
  }),

  rest.post('*/v1/surveyResponse', (req, res, ctx) => {
    console.log('req', req);
    return res(ctx.status(200), ctx.json({ success: true }));
  }),
];
