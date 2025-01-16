import React, { ReactNode } from 'react';
import MuiCard from '@material-ui/core/Card';
import MuiCardContent from '@material-ui/core/CardContent';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import styled from 'styled-components';

export const Card = styled(MuiCard)`
  margin-bottom: 1rem;
  border-color: ${props => props.theme.palette.grey['400']};
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1.2rem;
  padding-bottom: 0.7rem;
  margin-left: 30px;
  margin-right: 30px;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const HeaderTitle = styled(Typography)<TypographyProps>`
  font-size: 0.9375rem;
  line-height: 1.125rem;
  font-weight: 500;
`;

const HeaderLabel = styled(Typography)<TypographyProps>`
  font-size: 0.9375rem;
  line-height: 1.125rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
`;

interface CardHeaderProps {
  title: string | ReactNode;
  label?: string | ReactNode;
  color?: TypographyProps['color'];
}

export const CardHeader = ({ title, label, color = 'initial' }: CardHeaderProps) => (
  <StyledDiv>
    <HeaderTitle color={color}>{title}</HeaderTitle>
    <HeaderLabel color={color}>{label}</HeaderLabel>
  </StyledDiv>
);

export const CardContent = styled(MuiCardContent)`
  padding: 20px 30px;
`;

export const CardFooter = styled(props => <div {...props} />)`
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
  padding: 20px 30px 25px;
`;
