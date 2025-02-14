import React, { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { Button, Modal } from '../../../components';
import { KeyboardArrowRight } from '@material-ui/icons';

const Wrapper = styled.div`
  width: 100%;
  max-width: 28rem;
  .MuiDialog-paper {
    overflow: initial;
    padding-left: 0;
    padding-right: 0;
    > div {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }
  ul {
    overflow: auto;
  }
  p,
  h2,
  ul {
    padding: 0 2rem; // We want the scrollbar to be at the edge of the modal, so we remove the padding on the paper component and add it to the content
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    display: none;
  }
`;

const ModalButton = styled(Button).attrs({
  color: 'default',
})`
  width: 100%;
  margin: 0 auto;
  max-width: 28rem;
  background-color: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.text.primary};
  padding: 2rem 1.5rem 1.5rem;
  margin-top: 0.5rem;
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
const Image = styled.img`
  position: absolute;
  top: -1.8rem;
  width: 3.6rem;
  height: 3.6rem;
  left: 0.5rem;
`;

const Arrow = styled(KeyboardArrowRight)`
  position: absolute;
  right: 1rem;
  top: 1rem;
`;

const Title = styled.span`
  font-size: 1rem;
`;

const Body = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
`;

export const QRCodeModal = ({ children }: { children: ReactNode }) => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <Wrapper>
      <ModalButton onClick={() => setModalOpen(true)}>
        <Image src="/qr-code-icon.svg" />
        <TextWrapper>
          <Title>QR code generated</Title>
          <Body>Click to view, share or download your QR Code</Body>
        </TextWrapper>
        <Arrow />
      </ModalButton>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {children}
      </Modal>
    </Wrapper>
  );
};
