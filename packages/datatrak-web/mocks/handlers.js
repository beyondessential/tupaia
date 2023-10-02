import { rest } from 'msw';
import survey from './mockData/survey.json';
import surveyScreenComponents from './mockData/surveyScreenComponents.json';
// import options from './mockData/autocompleteOptions.json';

export const handlers = [
  rest.get('*/v1/surveys/test/surveyScreenComponents', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(surveyScreenComponents));
  }),

  rest.get('*/v1/surveys/test', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(survey));
  }),
];
