import { KeyboardArrowRight } from '@material-ui/icons';
import React, { ReactNode, useState } from 'react';
import styled from 'styled-components';

import { Button, Modal } from '../../../components';

const StyledModal = styled(Modal)`
  .MuiDialog-paper {
    overflow: initial;
    > div {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    // We want the scrollbar to be at the edge of the modal, so we remove the padding on the paper
    // component and add it to the content
    padding-inline: 0;
    ul {
      overflow: auto;
      padding-inline: 2rem;
    }
  }
`;

const ModalButton = styled(Button).attrs({
  color: 'default',
})`
  .MuiButton-label {
    display: contents;
  }

  --offset: 1.75rem;
  align-items: stretch;
  background-color: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.text.primary};
  flex-direction: column;
  margin-block-start: calc(1.25rem + var(--offset));
  padding-block: calc(-1 * var(--offset)) 1.5rem;
  padding-inline: 1.5rem;
  text-align: start;
  align-self: center;
  inline-size: 100%;
  max-inline-size: 28rem;
`;

const DecorativeIcon = styled.img.attrs({
  'aria-hidden': true,
  height: 56,
  width: 56,
})`
  aspect-ratio: 1;
  height: 3.5rem;
  width: auto;

  align-self: start;
  margin-block-start: calc(-1 * var(--offset));
  transform: translateX(-14%); // Optical alignment
`;

const Arrow = styled(KeyboardArrowRight)`
  inset-block-start: 1rem;
  inset-inline-end: 1rem;
  position: absolute;
`;

const Title = styled.h2`
  font-size: 1rem;
  margin-block: 0;
  padding-inline: 0;
`;

const Body = styled.p`
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  margin-block: 0;
  padding-inline: 0;
`;

export const QRCodeModal = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <ModalButton className={className} onClick={() => setModalOpen(true)}>
        <DecorativeIcon src="/qr-code-icon.svg" />
        <Title>QR&nbsp;code generated</Title>
        <Body>Click to view, share or download your QR&nbsp;code</Body>
        <Arrow />
      </ModalButton>
      <StyledModal open={modalOpen} onClose={() => setModalOpen(false)}>
        {children}
      </StyledModal>
    </>
  );
};
