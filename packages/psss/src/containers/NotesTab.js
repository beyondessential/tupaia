/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import {
  TextField,
  Button,
  UserMessage,
  UserMessageHeader,
  CardTabPanel,
  Toast,
} from '@tupaia/ui-components';
import { FetchLoader } from '../components/FetchLoader';
import { connectApi } from '../api';
import * as COLORS from '../constants/colors';

const GREY_SECTION_HEIGHT = '225px';

const Container = styled.div`
  padding-bottom: calc(${GREY_SECTION_HEIGHT} + 3rem);
`;

const StyledUserMessage = styled(UserMessage)`
  margin-bottom: 1.5rem;
`;

const PositionedToast = styled(Toast)`
  position: absolute;
  bottom: 100%;
  left: 1.25rem;
  right: 1.25rem;
  margin-bottom: 1.25rem;
`;

const GreySection = styled.div`
  position: absolute;
  height: ${GREY_SECTION_HEIGHT};
  bottom: 0;
  width: 100%;
  background: ${COLORS.LIGHTGREY};
  padding: 1.5rem 1.25rem;
  box-shadow: 0px -1px 0px ${props => props.theme.palette.grey['400']};
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
  const { handleSubmit, register, errors } = useForm();

  const handleSubmitNote = async (data, event) => {
    setStatus(STATUS.LOADING);
    await createNote(data);
    event.target.reset();
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
          <PositionedToast severity="error">A Server Error has occurred</PositionedToast>
        )}
        {status === STATUS.SUCCESS && (
          <PositionedToast severity="success" timeout={3000}>
            Note Successfully added
          </PositionedToast>
        )}
        <form onSubmit={handleSubmit(handleSubmitNote)}>
          <TextField
            inputRef={register({
              required: 'Required',
            })}
            name="note"
            placeholder="Type in your notes..."
            multiline
            rows="4"
            error={!!errors.note}
            helperText={errors.note && errors.note.message}
            InputProps={{
              readOnly: status === STATUS.LOADING,
            }}
          />
          <Button type="submit" fullWidth isLoading={status === STATUS.LOADING}>
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
