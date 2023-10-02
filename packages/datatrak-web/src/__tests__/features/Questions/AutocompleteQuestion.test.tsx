/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { Ref } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderComponent } from '../../helpers/render.tsx';
import { AutocompleteQuestion } from '../../../features/Questions/AutocompleteQuestion.tsx';
import { handlers } from '../../../../mocks/handlers.js';

jest.mock('../../../features/Survey/SurveyContext.tsx', () => ({
  useSurveyForm: () => ({
    getAnswerByQuestionId: () => 'theParentQuestionAnswer',
  }),
}));

const server = setupServer(...handlers);

const options = [
  {
    label: 'Red',
    value: 'red',
    attributes: {
      parentQuestion: 'anotherAnswer',
    },
  },
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
];

server.use(
  rest.get('*/v1/optionSets/theOptionSetId/options', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(options));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Example test', () => {
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

  it('renders the autocomplete question component without crashing', () => {
    renderComponent(<AutocompleteQuestion {...props} />);
  });

  it('renders all the options when there is no attribute filtering involved', () => {
    renderComponent(<AutocompleteQuestion {...props} />);

    const openButton = screen.getByTitle('Open');
    openButton.click();

    const displayOptions = screen.getAllByRole('option');
    expect(displayOptions.length).toBe(options.length);
    displayOptions.forEach((option, index) => {
      const text = options[index].label || options[index].value;
      expect(option).toHaveTextContent(text);
    });
  });

  it('renders only the filtered options when there are attribute filters defined', () => {
    renderComponent(
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

    const displayOptions = screen.getAllByRole('option');
    expect(displayOptions.length).toBe(2);
    expect(displayOptions[0]).toHaveTextContent('Blue');
    expect(displayOptions[1]).toHaveTextContent('green');
  });

  it('renders a "create new" option when createNew is enabled and there is an input value in the search', () => {
    renderComponent(
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

    const displayOptions = screen.getAllByRole('option');
    expect(displayOptions.length).toBe(1);

    expect(displayOptions[0]).toHaveTextContent('Add "Purple"');
  });

  it('Calls the onChange method with a new option when "Add ..." option is selected', () => {
    renderComponent(
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

    const displayOption = screen.getByRole('option', { name: 'Add "Purple"' });
    userEvent.click(displayOption);

    expect(onChange).toHaveBeenCalledWith({
      label: 'Purple',
      value: 'Purple',
      isNew: true,
      optionSetId: props.optionSetId,
    });
  });

  it('Calls the onChange method with the option when an existing option is selected', () => {
    renderComponent(<AutocompleteQuestion {...props} />);

    const openButton = screen.getByTitle('Open');
    openButton.click();

    const displayOption = screen.getByRole('option', { name: options[0].label });
    userEvent.click(displayOption);

    expect(onChange).toHaveBeenCalledWith(options[0]);
  });
});
