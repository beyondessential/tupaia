/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  TextField,
  Button,
  UserMessage,
  UserMessageHeader,
  CardTabPanel,
  ErrorAlert,
} from '@tupaia/ui-components';
import { FetchLoader } from './FetchLoader';
import { connectApi } from '../api';
import * as COLORS from '../constants/colors';

const GREY_SECTION_HEIGHT = '225px';

const Container = styled.div`
  padding-bottom: calc(${GREY_SECTION_HEIGHT} + 60px);
`;

const StyledUserMessage = styled(UserMessage)`
  margin-bottom: 1.5rem;
`;

const StyledErrorAlert = styled(ErrorAlert)`
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
`;

const StyledSuccessAlert = styled(ErrorAlert)`
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  color: #155724;
  background-color: #d4edda;
`;

const GreySection = styled.div`
  position: absolute;
  height: ${GREY_SECTION_HEIGHT};
  bottom: 0;
  width: 100%;
  background: ${COLORS.LIGHTGREY};
  padding: 1.5rem 1.25rem;
`;

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

const NotesTabComponent = ({ state, handleUpdate, handleDelete, createNote }) => {
  const { data: messages } = state;
  const [status, setStatus] = useState('');
  const [noteValue, setNoteValue] = useState('');

  const handleSubmitNote = async event => {
    event.preventDefault();
    setStatus(STATUS.LOADING);
    await createNote(noteValue);
    setNoteValue('');
    setStatus(STATUS.SUCCESS);
  };

  return (
    <Container>
      <CardTabPanel>
        <FetchLoader state={state}>
          {messages.map(data => {
            const message = {
              ...data.message,
              dateTime: data.message.created,
            };
            return (
              <StyledUserMessage
                key={message.id}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                Header={<UserMessageHeader user={data.user} dateTime={message.created} />}
                message={message}
              />
            );
          })}
        </FetchLoader>
      </CardTabPanel>
      <GreySection>
        {status === STATUS.ERROR && (
          <StyledErrorAlert>There was a server error. Please try again.</StyledErrorAlert>
        )}
        {status === STATUS.SUCCESS && (
          <StyledSuccessAlert>Your note was created.</StyledSuccessAlert>
        )}
        <form onSubmit={handleSubmitNote}>
          <TextField
            value={noteValue}
            onChange={event => setNoteValue(event.target.value)}
            name="textArea"
            placeholder="Type in your notes..."
            multiline
            rows="4"
            InputProps={{
              readOnly: status === STATUS.LOADING,
            }}
          />
          <Button type="submit" fullWidth isSubmitting={status === STATUS.LOADING}>
            Add Note
          </Button>
        </form>
      </GreySection>
    </Container>
  );
};

NotesTabComponent.propTypes = {
  state: PropTypes.object.isRequired,
  createNote: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

const mapApiToProps = api => ({
  createNote: () => api.post(),
  handleUpdate: () => api.post(),
  handleDelete: () => api.post(),
});

export const NotesTab = connectApi(mapApiToProps)(NotesTabComponent);
