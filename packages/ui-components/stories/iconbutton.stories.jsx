import React from 'react';
import {
  AddBoxOutlined,
  IndeterminateCheckBox,
  Autorenew,
  ChevronRight,
  ChevronLeft,
} from '@material-ui/icons';
import { IconButton, LightIconButton, ExportIcon } from '../src/components';
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
  <>
    <LightIconButton>
      <ChevronLeft />
    </LightIconButton>
    <LightIconButton>
      <ChevronRight />
    </LightIconButton>
  </>
);

LightArrows.story = {
  parameters: {
    backgrounds: [{ name: 'Header', value: COLORS.BLUE, default: true }],
  },
};
