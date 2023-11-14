/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { useUser } from '../../api/queries';
import { Dashboard } from '../../types';
import { Modal } from '../../components';
import { Form } from '../../components';
import { useForm } from 'react-hook-form';
import { TextField } from '../../components';
import { Title, ModalParagraph } from '../../components';
import { Button, Typography } from '@material-ui/core';
import { FORM_FIELD_VALIDATION } from '../../constants';
import { MODAL_SUBSCRIBE_TEXT, MODAL_UNSUBSCRIBE_TEXT, MODAL_SUBSCRIBE_TITLE, MODAL_UNSUBSCRIBE_TITLE } from './constants';

const Wrapper = styled.div`
  width: 30rem;
  max-width: 100%;
  padding: 2.5rem 1.875rem 0rem 1.875rem;
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-basis: 83.3333%;
  button {
    text-transform: none;
    padding: 0.5em 1.75em;
    font-size: 1rem;
  }
  .loading-screen {
    background-color: ${props => props.theme.palette.background.default};
    border: 0;
    button {
      padding: 0.5em 1.75em;
      font-size: 1rem;
    }
  }
`;

const ButtonGroup = styled.div`
  padding-top: 2.5rem;
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const SubscribeButton = styled(Button)`
  margin-left: 1.2rem;
`

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDashboard?: Dashboard;
}


export const SubscribeModal = ({ isOpen, onClose, activeDashboard }: SubscribeModalProps) => {
  const { entityCode } = useParams();
  const { data: user } = useUser();
  console.log('activeDashboard',activeDashboard)

  
  const formContext = useForm({
    mode: 'onChange',
    defaultValues: {
     email: user?.email 
    },
  });
  console.log('user',user)
  const handleSubscribe = () => {
    console.log('handling subscribing')
  }

  const verifyMailingList = activeDashboard => {
    const { mailingLists } = activeDashboard;
    if(!mailingLists) {
      return false
    }
    return true
  }

  const isSubscribed = (activeDashboard) => {
    const { mailingLists } = activeDashboard;
    const { isSubscribed } = mailingLists?.find(({mailingListEntityCode}) => {
      mailingListEntityCode === entityCode
    })
    return isSubscribed
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Wrapper>
            {activeDashboard && verifyMailingList(activeDashboard)? 
              (<Container>
              <Form formContext={formContext}>
                <Title align="left" variant="h5">
                  {isSubscribed(activeDashboard) ? MODAL_UNSUBSCRIBE_TITLE : MODAL_SUBSCRIBE_TITLE}
                </Title>
                <ModalParagraph align="left" gutterBottom>
                  {isSubscribed(activeDashboard) ? MODAL_UNSUBSCRIBE_TEXT : MODAL_SUBSCRIBE_TEXT}
                </ModalParagraph >
                <TextField 
                  name="email" 
                  label="Email" 
                  required
                  type="email"
                  options={{...FORM_FIELD_VALIDATION.EMAIL}}
                  value="dian@horribleshopping.com"
                  disabled
                />
                <ButtonGroup>
                  <Button variant="outlined" color="default" onClick={onClose} disabled={false}>
                    Cancel
                  </Button>
                  <SubscribeButton
                    variant="contained"
                    color="primary"
                    onClick={handleSubscribe}
                    disabled={false}
                  >
                    Subscribe
                  </SubscribeButton>
                </ButtonGroup>
              </Form>
              </Container>)
            :
            (
              <Container>
                <Typography color="error" gutterBottom>Something went wrong.</Typography>
              </Container>
            )
          }
      </Wrapper>
    </Modal>
  );
};
