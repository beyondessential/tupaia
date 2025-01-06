/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../helpers/testingRenderer';
import { UserMessage, UserMessageHeader } from '../../../components/UserMessage';

const exampleUser = {
  name: 'Dr. Sarah De Jones',
};

const message = {
  id: 'user-message-123',
  created: new Date(),
};

function renderUserMessage() {
  render(
    <UserMessage
      onUpdate={() => {}}
      onDelete={() => {}}
      Header={<UserMessageHeader user={exampleUser} dateTime={message.created} />}
      message={message}
    />,
  );
}

describe('user message', () => {
  it('renders', async () => {
    renderUserMessage();
    expect(screen.getByText(/sarah de jones/i)).toBeInTheDocument();
  });

  it('is editable', async () => {
    renderUserMessage();

    const newMessage =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit Aliquam id enim id lorem porta rhoncus';

    userEvent.click(screen.getByRole('button', { name: /open/i }));
    userEvent.click(await screen.findByText(/edit/i));

    const input = screen.getByRole('textbox');
    await userEvent.type(input, newMessage);
    userEvent.click(screen.getByRole('button', { name: /update/i }));
    expect(input.value).toBe(newMessage);

    // Fix the "not wrapped in act warning"
    // see: https://github.com/testing-library/react-testing-library/issues/523
    await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  });
});
