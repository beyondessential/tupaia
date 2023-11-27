/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { useUser } from '../../../api/queries';
import { Dashboard } from '../../../types';
import { Modal } from '../../../components';
import { Form } from '../../../components';
import { useForm } from 'react-hook-form';
import { TextField } from '../../../components';
import { Title, ModalParagraph } from '../../../components';
import { Button, Typography } from '@material-ui/core';
import { FORM_FIELD_VALIDATION } from '../../../constants';
import { MODAL_SUBSCRIBE_TEXT, MODAL_SUBSCRIBE_TITLE } from './constants';
import { useSubscribe } from '../../../api/mutations';
import { SpinningLoader } from '@tupaia/ui-components';
import { MOBILE_BREAKPOINT } from '../../../constants';
import { useMailingList } from './useMailingList'

const Wrapper = styled.div`
  width: 45rem;
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

const StyledTextField = styled(TextField)`
  width: 50%;
  margin: auto;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100%;
  }
  
`

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDashboard?: Dashboard;
  onSubscribe: () => void;
}

export const SubscribeModal = ({ isOpen, onClose, activeDashboard, onSubscribe }: SubscribeModalProps) => {
  const { entityCode, projectCode } = useParams();
  const { data: user, isLoggedIn, isLoading } = useUser();
  const formContext = useForm({
    mode: 'onChange',
  });
  const { mutateAsync: subscribe } = useSubscribe(projectCode, entityCode, activeDashboard?.code);

  const { hasMailingList } = useMailingList(activeDashboard, entityCode)

  const handleSubmit = async (data) => {
    await subscribe(data);
    onSubscribe();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Wrapper>
            {activeDashboard && hasMailingList? 
              (<Container>
                <Form formContext={formContext} onSubmit={handleSubmit}>
                  <Title align="left" variant="h5">
                    {MODAL_SUBSCRIBE_TITLE}
                  </Title>
                  <ModalParagraph align="left" gutterBottom>
                    {MODAL_SUBSCRIBE_TEXT}
                  </ModalParagraph >
                  {isLoading && <SpinningLoader mt={5} />}
                  <StyledTextField 
                    name="email" 
                    label="Email" 
                    required
                    defaultValue={isLoggedIn ? user.email : ''}
                    type="email"
                    options={{...FORM_FIELD_VALIDATION.EMAIL}}
                    inputProps={{readOnly: isLoggedIn}}
                  />
                  <ButtonGroup>
                    <Button variant="outlined" color="default" onClick={onClose}>
                      Cancel
                    </Button>
                    <SubscribeButton
                      type="submit"
                      variant="contained"
                      color="primary"
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
