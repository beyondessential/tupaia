import { NextFunction } from 'express';
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
        formatTasksWithComments: jest.fn().mockResolvedValue([]),
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
        {},
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
        'Exclude completed tasks',
        {
          query: {
            filters: [
              {
                id: 'task_status',
                value: { comparator: 'NOT IN', comparisonValue: ['completed'] },
              },
            ],
          },
        },
        {
          filter: {
            task_status: { comparator: 'NOT IN', comparisonValue: ['completed'] },
          },
        },
      ],
      [
        'with specified assignee',
        {
          query: {
            filters: [
              {
                id: 'assignee_id',
                value: 'foobar_baz',
              },
            ],
          },
        },
        {
          filter: {
            assignee_id: 'foobar_baz',
          },
        },
      ],
      [
        'All completed tasks setting false and completed status filter',
        {
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
        'Due date filter is between start and end of day',
        {
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
