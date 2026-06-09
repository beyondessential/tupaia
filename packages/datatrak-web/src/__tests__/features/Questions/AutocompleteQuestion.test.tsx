import React, { Ref } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderComponent } from '../../helpers/render';
import { AutocompleteQuestion } from '../../../features/Questions';

jest.mock('../../../features/Survey/SurveyContext/SurveyContext.tsx', () => ({
  useSurveyForm: () => ({
    getAnswerByQuestionId: () => 'theParentQuestionAnswer',
  }),
}));

jest.mock('../../../api/queries/useUser', () => {
  return {
    useUser: jest.fn().mockReturnValue({}),
  };
});

const options = [
  {
    label: 'Blue',
    value: 'blue',
    attributes: {
      parentQuestion: 'theParentQuestionAnswer',
    },
  },
  {
    value: 'green',
  },
  {
    label: 'Red',
    value: 'red',
    attributes: {
      parentQuestion: 'anotherAnswer',
    },
  },
];
const server = setupServer(
  rest.get('*/v1/optionSets/theOptionSetId/options', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(options));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Autocomplete Question', () => {
  const onChange = jest.fn();
  const props = {
    id: 'theId',
    label: "What's your favourite colour?",
    name: 'color',
    optionSetId: 'theOptionSetId',
    config: {},
    controllerProps: {
      value: null,
      onChange,
      ref: {
        current: {},
      } as Ref<HTMLInputElement>,
    },
  };

  it('renders the autocomplete question component without crashing', async () => {
    await renderComponent(<AutocompleteQuestion {...props} />);
  });

  it('renders all the options when there is no attribute filtering involved', async () => {
    await renderComponent(<AutocompleteQuestion {...props} />);

    const openButton = screen.getByTitle('Open');
    openButton.click();

    const displayOptions = await screen.findAllByRole('option');
    expect(displayOptions.length).toBe(options.length);
    displayOptions.forEach((option, index) => {
      const text = options[index].label || options[index].value;
      expect(option).toHaveTextContent(text);
    });
  });

  it('renders only the filtered options when there are attribute filters defined', async () => {
    await renderComponent(
      <AutocompleteQuestion
        {...props}
        config={{
          autocomplete: {
            attributes: {
              parentQuestion: {
                questionId: 'theParentQuestionId',
              },
            },
          },
        }}
      />,
    );

    const openButton = screen.getByTitle('Open');
    openButton.click();

    const displayOptions = await screen.findAllByRole('option');
    expect(displayOptions.length).toBe(2);
    expect(displayOptions[0]).toHaveTextContent('Blue');
    expect(displayOptions[1]).toHaveTextContent('green');
  });

  it('renders a "create new" option when createNew is enabled and there is an input value in the search', async () => {
    await renderComponent(
      <AutocompleteQuestion
        {...props}
        config={{
          autocomplete: {
            createNew: true,
          },
        }}
      />,
    );

    const searchInput = screen.getByRole('textbox');
    userEvent.type(searchInput, 'Purple');

    const displayOptions = await screen.findAllByRole('option');
    expect(displayOptions.length).toBe(1);

    expect(displayOptions[0]).toHaveTextContent('Add “Purple”');
  });

  it('Calls the onChange method with a new option when “Add…” option is selected', async () => {
    await renderComponent(
      <AutocompleteQuestion
        {...props}
        config={{
          autocomplete: {
            createNew: true,
          },
        }}
      />,
    );

    const searchInput = screen.getByRole('textbox');
    userEvent.type(searchInput, 'Purple');

    const displayOption = await screen.findByRole('option', { name: 'Add “Purple”' });
    userEvent.click(displayOption);

    expect(onChange).toHaveBeenCalledWith('Purple');
  });

  it('Calls the onChange method with the option when an existing option is selected', async () => {
    await renderComponent(<AutocompleteQuestion {...props} />);

    const openButton = screen.getByTitle('Open');
    openButton.click();

    const displayOption = await screen.findByRole('option', { name: options[0].label });
    userEvent.click(displayOption);

    expect(onChange).toHaveBeenCalledWith(options[0].value);
  });
});
