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
      cookie: 'show_completed_tasks=true;show_cancelled_tasks=true;all_assignees_tasks=true',
    },
    query: {},
    models: {
      task: {
        customColumnSelectors: {},
        DatabaseRecordClass: { joins: null },
        countTasksForAccessPolicy: jest.fn().mockResolvedValue(null),
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
            cookie: 'show_completed_tasks=true;show_cancelled_tasks=true;all_assignees_tasks=true',
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
            cookie: 'show_completed_tasks=false;show_cancelled_tasks=true;all_assignees_tasks=true',
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
            cookie: 'show_completed_tasks=true;show_cancelled_tasks=true;all_assignees_tasks=false',
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
            cookie: 'show_completed_tasks=false;show_cancelled_tasks=true;all_assignees_tasks=true',
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
            cookie: 'show_completed_tasks=false;show_cancelled_tasks=true;all_assignees_tasks=true',
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
      [
        'Due date filter is between start and end of day',
        {
          headers: {
            cookie: 'show_completed_tasks=true;show_cancelled_tasks=true;all_assignees_tasks=true',
          },
          query: {
            filters: [
              {
                id: 'due_date',
                value: '2021-01-01 23:59:59.000+12:00',
              },
            ],
          },
        },
        {
          filter: {
            due_date: {
              comparator: 'BETWEEN',
              comparisonValue: [
                new Date('2021-01-01T00:00:00.000+12:00').getTime(),
                new Date('2021-01-01T23:59:59.000+12:00').getTime(),
              ],
            },
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
