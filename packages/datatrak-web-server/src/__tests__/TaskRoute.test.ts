/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { NextFunction, Request } from 'express';
import { TasksRoute } from '../routes';

const mockFunc = jest.fn(() => []);

const makeMockRequest = (overwrites: any) => {
  return {
    headers: {
      // defaults to make the tests simpler
      cookie: 'all_completed_tasks=true;all_cancelled_tasks=true;all_assignees_tasks=true',
    },
    query: {},
    models: {
      database: {
        count: () => null,
      },
      task: {
        customColumnSelectors: {},
        DatabaseRecordClass: { joins: null },
      },
    },
    ctx: {
      services: {
        central: {
          fetchResources: mockFunc,
          getUser: () => ({ id: 'test' }),
        },
      },
    },
    ...overwrites,
  };
};

const mockResponse: any = {
  json: jest.fn(),
  status: jest.fn(),
};

const mockNext: NextFunction = jest.fn();

class TestableTaskRoute extends TasksRoute {
  public constructor(params: any) {
    const req = makeMockRequest(params);
    // @ts-ignore
    super(req, mockResponse, mockNext);
  }
}

describe('TaskRoute', () => {
  describe('should format filters correctly', () => {
    const testData = [
      [
        'Default filter settings',
        {
          headers: {
            cookie: 'all_completed_tasks=true;all_cancelled_tasks=true;all_assignees_tasks=true',
          },
        },
        {
          filter: {},
        },
      ],
      [
        'Partial text filter',
        {
          query: {
            filters: [
              {
                id: 'survey.name',
                value: 'a',
              },
            ],
          },
        },
        {
          filter: { 'survey.name': { comparator: 'ilike', comparisonValue: 'a%' } },
        },
      ],
      [
        'Status filter',
        {
          query: {
            filters: [
              {
                id: 'task_status',
                value: 'to_do',
              },
            ],
          },
        },
        {
          filter: {
            task_status: 'to_do',
          },
        },
      ],
      [
        'All completed tasks setting false',
        {
          headers: {
            cookie: 'all_completed_tasks=false;all_cancelled_tasks=true;all_assignees_tasks=true',
          },
        },
        {
          filter: {
            task_status: { comparator: 'NOT IN', comparisonValue: ['completed'] },
          },
        },
      ],
      [
        'All assignee filter setting false',
        {
          headers: {
            cookie: 'all_completed_tasks=true;all_cancelled_tasks=true;all_assignees_tasks=false',
          },
        },
        {
          filter: {
            assignee_id: 'test',
          },
        },
      ],
      [
        'All completed tasks setting false and completed status filter',
        {
          headers: {
            cookie: 'all_completed_tasks=false;all_cancelled_tasks=true;all_assignees_tasks=true',
          },
          query: {
            filters: [
              {
                id: 'task_status',
                value: 'completed',
              },
            ],
          },
        },
        {
          filter: {
            task_status: 'completed',
          },
        },
      ],
      [
        'All completed tasks setting false and to_do status filter',
        {
          headers: {
            cookie: 'all_completed_tasks=false;all_cancelled_tasks=true;all_assignees_tasks=true',
          },
          query: {
            filters: [
              {
                id: 'task_status',
                value: 'to_do',
              },
            ],
          },
        },
        {
          filter: {
            task_status: 'to_do',
          },
        },
      ],
    ];

    // @ts-ignore
    it.each(testData)('%s', async (_, filters, result) => {
      const route = new TestableTaskRoute(filters);
      await route.buildResponse();
      expect(mockFunc).toHaveBeenCalledWith('tasks', expect.objectContaining(result));
    });
  });
});
