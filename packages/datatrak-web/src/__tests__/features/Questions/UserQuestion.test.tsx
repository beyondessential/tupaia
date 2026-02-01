import React, { Ref } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderComponent } from '../../helpers/render';
import { UserQuestion } from '../../../features/Questions';

jest.mock('../../../features/Survey/SurveyContext/SurveyContext.tsx', () => ({
  useSurveyForm: () => ({
    countryCode: 'DL',
  }),
}));

jest.mock('../../../api/queries/useUser', () => {
  return {
    useUser: jest.fn().mockReturnValue({}),
  };
});

const users = [
  {
    name: 'Teddy Bear',
    id: '1',
  },
  {
    name: 'Grizzly Bear',
    id: '2',
  },
  {
    name: 'Panda Bear',
    id: '3',
  },
  {
    name: 'Koala Bear',
    id: '4',
  },
  {
    name: 'Polar Bear',
    id: '5',
  },
];
const server = setupServer(
  rest.get('*/v1/users/DL', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(users));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('User Question', () => {
  const onChange = jest.fn();
  const props = {
    id: 'theId',
    label: 'Who should the task be assigned to?',
    name: 'assignee',
    config: {
      user: {
        permissionGroup: 'Public',
      },
    },
    controllerProps: {
      value: null,
      onChange,
      ref: {
        current: {},
      } as Ref<HTMLInputElement>,
    },
  };

  it('renders the user question component without crashing', async () => {
    await renderComponent(<UserQuestion {...props} />);
  });

  it('renders all the options', async () => {
    await renderComponent(<UserQuestion {...props} />);

    const openButton = screen.getByTitle('Open');
    openButton.click();

    const displayOptions = await screen.findAllByRole('option');
    expect(displayOptions.length).toBe(users.length);
    displayOptions.forEach((option, index) => {
      const text = users[index].name;
      expect(option).toHaveTextContent(text);
    });
  });

  it('Calls the onChange method with the option value', async () => {
    await renderComponent(<UserQuestion {...props} />);

    const openButton = screen.getByTitle('Open');
    openButton.click();

    const displayOption = await screen.findByRole('option', { name: users[0].name });
    userEvent.click(displayOption);

    expect(onChange).toHaveBeenCalledWith({
      ...users[0],
      label: users[0].name,
      value: users[0].id,
    });
  });
});
