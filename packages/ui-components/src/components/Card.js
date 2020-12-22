/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiCard from '@material-ui/core/Card';
import MuiCardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
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

const HeaderTitle = styled(Typography)`
  font-size: 0.9375rem;
  line-height: 1.125rem;
  font-weight: 500;
`;

const HeaderLabel = styled(Typography)`
  font-size: 0.9375rem;
  line-height: 1.125rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
`;

export const CardHeader = ({ title, label, color }) => (
  <StyledDiv>
    <HeaderTitle color={color}>{title}</HeaderTitle>
    <HeaderLabel color={color}>{label}</HeaderLabel>
  </StyledDiv>
);

CardHeader.propTypes = {
  title: PropTypes.any.isRequired,
  label: PropTypes.any,
  color: PropTypes.string,
};

CardHeader.defaultProps = {
  color: 'initial',
  label: null,
};

export const CardContent = styled(MuiCardContent)`
  padding: 20px 30px;
`;

export const CardFooter = styled(props => <div {...props} />)`
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
  padding: 20px 30px 25px;
`;
