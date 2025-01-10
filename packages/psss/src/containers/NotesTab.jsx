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
import { ComingSoon, FetchLoader } from '../components';
import { createNote, updateNote, deleteNote } from '../api';
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

export const NotesTab = ({ state }) => {
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
    <Container style={{ position: 'relative' }}>
      <ComingSoon text="Alert notes coming soon" />
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
                onUpdate={updateNote}
                onDelete={deleteNote}
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

NotesTab.propTypes = {
  state: PropTypes.object.isRequired,
};
