import React, { ReactNode } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.palette.background.paper};
  height: 100%;
  top: 0;
  right: 0;
  position: absolute;
  width: 30%;
  max-width: 24rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
`;

const Container = styled.div`
  overflow: auto;
  padding: 5rem 1.5rem 1.5rem; // to allow space for the success notification
`;

export const QRCodePanel = ({ children }: { children: ReactNode }) => {
  return (
    <Wrapper>
      <Container>{children}</Container>
    </Wrapper>
  );
};
