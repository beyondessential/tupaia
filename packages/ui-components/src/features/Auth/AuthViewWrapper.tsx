import { Paper, PaperProps, Typography } from '@material-ui/core';
import React, { ReactNode } from 'react';
import styled from 'styled-components';

const Wrapper = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
  width: 100%;
  box-shadow: none;
  box-sizing: border-box;
  &.MuiPaper-rounded.MuiPaper-root {
    padding: 2.5rem 1rem 4.2rem 1rem;
  }
  form a:is(:hover, :focus-visible) {
    color: ${({ theme }) => theme.palette.primary.main};
  }
  .MuiFormControl-root {
    margin-bottom: 1rem;
  }
  .MuiTypography-root.MuiFormControlLabel-label,
  .MuiTypography-root.MuiFormControlLabel-label a {
    font-size: 0.6875rem;
  }
  .MuiSvgIcon-root {
    font-size: 1rem;
  }
  .MuiCheckbox-root {
    padding-right: 0.375rem;
  }
  p a {
    font-weight: ${({ theme }) => theme.typography.fontWeightBold};
    text-decoration: none;
    color: ${({ theme }) => theme.palette.text.primary};
    &:hover,
    &:focus-visible {
      text-decoration: underline;
    }
  }
  @media screen and (max-width: 900px) {
    height: 100%;
  }
`;

const Title = styled(Typography)`
  font-size: 2rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
`;

const Subtitle = styled(Typography)`
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  line-height: 1.3;
  margin-block-start: 0.32rem;
  text-align: center;
  text-wrap: balance;
`;

interface AuthViewWrapperProps extends PaperProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthViewWrapper = ({ children, title, subtitle, ...props }: AuthViewWrapperProps) => {
  return (
    <Wrapper {...props}>
      {title && <Title variant="h2">{title}</Title>}
      {subtitle && <Subtitle variant="h3">{subtitle}</Subtitle>}
      {children}
    </Wrapper>
  );
};
