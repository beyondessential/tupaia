/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiCard from '@material-ui/core/Card';
import MuiCardActions from '@material-ui/core/CardActions';
import MuiCardContent from '@material-ui/core/CardContent';
import styled from 'styled-components';
import * as COLORS from '../theme/colors';

/*
 * Card
 */
export const Card = styled(MuiCard)`
  margin-bottom: 1rem;
  border-color: ${COLORS.GREY_DE};
`;

/*
 * Card Header
 */
export const CardHeader = styled(props => <div {...props}/>)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #E7E7E7;
  font-size: 14px;
  font-weight: 500; 
  
  p {
    font-size: 14px;
    font-weight: 500; 
  }
`;

/*
 * Card Content
 */
export const CardContent = styled(MuiCardContent)`
    padding: 1.5rem 1.5rem 2rem;
`;

/*
 * Card Footer
 */
export const CardFooter = styled(props => <div {...props} />)`
    border-top: 1px solid #E7E7E7;
    padding: 1.5rem 1.5rem 2rem;
`;

/*
 * Card Actions
 */
export const CardActions = styled(MuiCardActions)`
  // Custom styles
`;