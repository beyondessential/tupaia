/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import React from 'react';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem;
`;

const Heading = styled(Typography)`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: ${props => props.theme.palette.text.primary};
`;

const Subheading = styled(Typography)`
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: ${props => props.theme.palette.text.secondary};
`;

const Text = styled(Typography)`
  font-size: 14px;
  line-height: 16px;
  color: ${props => props.theme.palette.text.secondary};
`;

const SuperText = styled(Typography)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-weight: bold;
  font-size: 11px;
  line-height: 13px;
  text-transform: uppercase;
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 0.5rem;
`;

const HighlightText = styled(Typography)`
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  color: #d13333;
  margin-left: 6px;
`;

export const CardHeader = () => {
  return (
    <Wrapper>
      <div>
        <Heading>Week 7</Heading>
        <Subheading>Feb 25 - Mar 1, 2020</Subheading>
      </div>
      <div>
        <SuperText>
          Prev.Week <HighlightText>+50%</HighlightText>
        </SuperText>
        <Text>Total Cases for all Sites: 21,215</Text>
      </div>
    </Wrapper>
  );
};
