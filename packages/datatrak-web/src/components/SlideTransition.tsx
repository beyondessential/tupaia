/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { TransitionProps } from '@material-ui/core/transitions';
import Slide from '@material-ui/core/Slide';

/**
 * Taken from [Material UI's example](https://v4.mui.com/components/dialogs/#full-screen-dialogs) to make the dialog slide up from the bottom
 */
export const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});
