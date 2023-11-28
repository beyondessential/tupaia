/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { Ref } from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { screen } from '@testing-library/react';
import { spyOnMockRequest } from '../../helpers/spyOnMockRequest';
import { renderComponent } from '../../helpers/render';
import { EntityQuestion } from '../../../features/Questions';

jest.mock('../../../features/Survey/SurveyContext/SurveyContext.tsx', () => ({
  useSurveyForm: () => ({
    getAnswerByQuestionId: () => 'blue',
    surveyProjectCode: 'explore',
  }),
}));

jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form');
  return {
    ...actual,
    useFormContext: jest.fn().mockReturnValue({ errors: {} }),
  };
});

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    useParams: jest.fn().mockReturnValue({ countryCode: 'DL' }),
  };
});

const entitiesData = [
  {
    id: '5d3f8844bf6b4031bfff591b',
    parentName: 'Demo Land',
    code: 'DL_South West',
    name: 'South West',
    type: 'district',
    attributes: {
      color: 'green',
    },
  },
  {
    id: '5d3f8844df283d31bfd08fc3',
    parentName: 'Demo Land',
    code: 'DL_North',
    name: 'North',
    type: 'district',
    attributes: {
      color: 'blue',
    },
  },
  {
    id: '5d3f88448ec12f31bf9c694e',
    parentName: 'Demo Land',
    code: 'DL_South East',
    name: 'South East',
    type: 'district',
    attributes: {
      color: 'blue',
    },
  },
];

const userData = { project: { code: 'explore' }, country: { code: 'DL' } };

const server = setupServer(
  rest.get('*/v1/entities', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(entitiesData));
  }),
  rest.get('*/v1/getUser', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(userData));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Entity Question', () => {
  const onChange = jest.fn();
  const props = {
    id: 'theId',
    label: 'Select an entity',
    name: 'entity',
    config: {},
    controllerProps: {
      value: null,
      onChange,
      ref: {
        current: {},
      } as Ref<HTMLInputElement>,
    },
  };

  it('renders the Entity Question component without crashing', () => {
    renderComponent(<EntityQuestion {...props} />);
  });

  it('renders all the options when there is no config', async () => {
    renderComponent(<EntityQuestion {...props} />);

    const displayOptions = await screen.findAllByRole('button');
    expect(displayOptions.length).toBe(entitiesData.length);

    displayOptions.forEach((option, index) => {
      const { name, parentName } = entitiesData[index];
      expect(option).toHaveTextContent(name);
      expect(option).toHaveTextContent(parentName);
    });
  });

  it('correctly constructs the request filter for the entities request, ', async () => {
    const entitiesRequest = spyOnMockRequest(server, 'GET', '*entities');

    renderComponent(
      <EntityQuestion
        {...props}
        config={{
          entity: {
            filter: {
              type: 'facility',
              parentId: {
                questionId: 'theParentQuestionId',
              },
            },
          },
        }}
      />,
    );

    const request = await entitiesRequest;
    const queryParams = request.url.searchParams;
    expect(queryParams.get('filter[type]')).toBe('facility');
    expect(queryParams.get('filter[countryCode]')).toBe('DL');
    expect(queryParams.get('filter[projectCode]')).toBe('explore');
    expect(queryParams.get('filter[parentId]')).toBe('blue');
  });

  it('renders only the filtered options when there are attribute filters defined', async () => {
    renderComponent(
      <EntityQuestion
        {...props}
        config={{
          entity: {
            filter: {
              attributes: {
                color: {
                  questionId: 'someOtherQuestionId',
                },
              },
            },
          },
        }}
      />,
    );

    const displayOptions = await screen.findAllByRole('button');
    expect(displayOptions.length).toBe(2);
    expect(displayOptions[0]).toHaveTextContent('North');
    expect(displayOptions[1]).toHaveTextContent('South East');
  });

  it('Does not crash if there is legacy config ', async () => {
    renderComponent(
      <EntityQuestion
        {...props}
        config={{
          entity: {
            parentId: {
              questionId: 'abc',
            },
            grandparentId: {
              questionId: 'abc',
            },
            type: ['facility', 'village'],
            attributes: {
              type: {
                questionId: 'abc',
              },
            },
            code: {
              questionId: 'abc',
            },
            name: {
              questionId: 'abc',
            },
          },
        }}
      />,
    );

    const displayOptions = await screen.findAllByRole('button');
    expect(displayOptions.length).toBe(entitiesData.length);
  });
});
