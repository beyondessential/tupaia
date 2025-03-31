import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';
import { HEADER_HEIGHT } from '../constants';
import { SafeArea } from '../components';

const Wrapper = styled(SafeArea).attrs({
  bottom: true,
  left: true,
  right: true,
})`
  align-items: center;
  block-size: calc(100dvb - 2 * ${HEADER_HEIGHT});
  display: flex;
  justify-content: center;
  padding-top: 1rem;

  form p,
  form a,
  .MuiTypography-root.MuiFormControlLabel-label {
    font-size: 0.8125rem;
  }
  .MuiPaper-root {
    overflow: auto;
    padding: 1rem;
    height: auto;
    max-height: 100%;
  }
  ${({ theme }) => theme.breakpoints.up('sm')} {
    .MuiPaper-root {
      padding: 2rem 3rem;
    }
  }
`;

export const CentredLayout = () => {
  return (
    <Wrapper>
      <Outlet />
    </Wrapper>
  );
};
