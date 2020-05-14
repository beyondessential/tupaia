/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import {
  AddBoxOutlined,
  IndeterminateCheckBox,
  Autorenew,
  ChevronRight,
  ChevronLeft,
} from '@material-ui/icons';
import { IconButton, LightIconButton } from '../src';
import * as COLORS from './story-utils/theme/colors';

export default {
  title: 'IconButton',
};

export const Plus = () => (
  <IconButton>
    <AddBoxOutlined />
  </IconButton>
);

export const Minus = () => (
  <IconButton>
    <IndeterminateCheckBox />
  </IconButton>
);

export const AutoRenew = () => (
  <IconButton>
    <Autorenew />
  </IconButton>
);

export const LightArrows = () => (
  <React.Fragment>
    <LightIconButton>
      <ChevronLeft />
    </LightIconButton>
    <LightIconButton>
      <ChevronRight />
    </LightIconButton>
  </React.Fragment>
);

LightArrows.story = {
  parameters: {
    backgrounds: [{ name: 'Header', value: COLORS.BLUE, default: true }],
  },
};
