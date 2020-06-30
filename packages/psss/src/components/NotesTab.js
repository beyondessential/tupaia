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
import { fetchStateShape } from '../hooks';
import { FetchLoader } from './FetchLoader';
import * as COLORS from '../constants/colors';

const GREY_SECTION_HEIGHT = '14rem';

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
  padding: 1.5rem 1.25rem;
`;

export const NotesTab = ({ state }) => {
  const { data: messages } = state;

  const handleUpdate = () => {
    console.log('update....');
  };

  const handleDelete = () => {
    console.log('delete...');
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
        <TextField name="textArea" placeholder="Type in your notes..." multiline rows="4" />
        <Button fullWidth>Add Note</Button>
      </GreySection>
    </Container>
  );
};

NotesTab.propTypes = {
  state: PropTypes.shape(fetchStateShape).isRequired,
};
