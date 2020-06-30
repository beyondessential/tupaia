/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  TextField,
  Button,
  UserMessage,
  UserMessageHeader,
  CardTabPanel,
} from '@tupaia/ui-components';
import { FetchLoader } from './FetchLoader';
import { connectApi } from '../api';
import * as COLORS from '../constants/colors';

const GREY_SECTION_HEIGHT = '225px';

const Container = styled.div`
  padding-bottom: ${GREY_SECTION_HEIGHT};
`;

const StyledUserMessage = styled(UserMessage)`
  margin-bottom: 1.5rem;
`;

const GreySection = styled.div`
  position: absolute;
  height: ${GREY_SECTION_HEIGHT};
  bottom: 0;
  width: 100%;
  background: ${COLORS.LIGHTGREY};
  padding: 25px 20px;
`;

const NotesTabComponent = ({ state, handleUpdate, handleDelete }) => {
  const { data: messages } = state;

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
        <TextField name="textArea" placeholder="Type in your notes..." multiline rows="4" />
        <Button fullWidth>Add Note</Button>
      </GreySection>
    </Container>
  );
};

NotesTabComponent.propTypes = {
  state: PropTypes.object.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

const mapApiToProps = api => ({
  handleUpdate: () => api.post(),
  handleDelete: () => api.post(),
});

export const NotesTab = connectApi(mapApiToProps)(NotesTabComponent);
