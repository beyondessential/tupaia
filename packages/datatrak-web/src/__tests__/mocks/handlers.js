import { rest } from 'msw';
import survey from './mockData/survey.json';

export const handlers = [
  rest.get('*/v1/surveys/test', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(survey));
  }),
];
