/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import * as COLORS from '../theme/colors';

const Bar = styled.div`
  position: relative;
`;

const OuterBar = styled.div`
  background-color: #ddf1ff;
  border-radius: 30px;
  height: 8px;
  width: 100%;
`;

const InnerBar = styled(OuterBar)`
  position: absolute;
  top: 0;
  left: 0;
  background-color: #9acaeb;
`;

const Caption = styled.p`
  color: ${COLORS.GREY_72};
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  margin-bottom: 12px;
`;

const MeterBar = ({ value, total, ...props }) => (
  <Bar {...props}>
    <OuterBar />
    <InnerBar style={{ width: `${(value / total) * 100}%` }} />
  </Bar>
);

export const Meter = ({ value, total, caption = 'Sites reported', ...props }) => (
  <div {...props}>
    <Caption>
      {caption}: <strong>{`${value}/${total}`}</strong>
    </Caption>
    <MeterBar {...{ value, total }} />
  </div>
);
