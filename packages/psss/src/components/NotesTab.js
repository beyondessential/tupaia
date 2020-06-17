/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { TextField, Button, UserMessage, CardTabPanel } from '@tupaia/ui-components';
import * as COLORS from '../constants/colors';
import { connectApi } from '../api';

const greySectionHeight = '225px';

const Container = styled.div`
  padding-bottom: ${greySectionHeight};
`;

const StyledUserMessage = styled(UserMessage)`
  margin-bottom: 2rem;
`;

const GreySection = styled.div`
  position: absolute;
  height: ${greySectionHeight};
  bottom: 0;
  width: 100%;
  background: ${COLORS.LIGHTGREY};
  padding: 25px 20px;
`;

const FETCH_STATUSES = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

const DEFAULT_FETCH_STATE = { data: [], count: 0, errorMessage: '', status: FETCH_STATUSES.IDLE };

const NotesTabComponent = ({ fetchData }) => {
  const [fetchState, setFetchState] = useState(DEFAULT_FETCH_STATE);

  useEffect(() => {
    let updateFetchState = newFetchState =>
      setFetchState(prevFetchState => ({ ...prevFetchState, ...newFetchState }));

    updateFetchState({ status: FETCH_STATUSES.LOADING });

    (async () => {
      try {
        const { data, count } = await fetchData();
        updateFetchState({
          ...DEFAULT_FETCH_STATE,
          data,
          count,
          status: FETCH_STATUSES.SUCCESS,
        });
      } catch (error) {
        updateFetchState({ errorMessage: error.message, status: FETCH_STATUSES.ERROR });
      }
    })();

    return () => {
      updateFetchState = () => {}; // discard the fetch state update if this request is stale
    };
  }, [fetchData]);

  const handleUpdate = () => {
    console.log('update');
  };

  const handleDelete = () => {
    console.log('delete');
  };

  const { data: messages, status, count, errorMessage } = fetchState;

  console.log('messages', messages);

  if (status === 'idle' || status === 'loading') {
    return <CardTabPanel>Loading...</CardTabPanel>;
  } else if (count === 0) {
    return <CardTabPanel>There are no messages</CardTabPanel>;
  } else if (status === 'error') {
    console.log('error message', errorMessage);
    return <CardTabPanel>Error</CardTabPanel>;
  }

  return (
    <Container>
      <CardTabPanel>
        {messages.map(data => {
          const message = {
            ...data.message,
            dateTime: data.message.created,
          };
          return (
            <StyledUserMessage
              key={message.id}
              message={message}
              user={data.user}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          );
        })}
      </CardTabPanel>
      <GreySection>
        <TextField name="textArea" placeholder="Type in your notes..." multiline rows="4" />
        <Button fullWidth>Add Note</Button>
      </GreySection>
    </Container>
  );
};

NotesTabComponent.propTypes = {
  fetchData: PropTypes.func.isRequired,
};

const mapApiToProps = api => ({
  fetchData: () => api.get('messages'),
});

export const NotesTab = connectApi(mapApiToProps)(NotesTabComponent);
