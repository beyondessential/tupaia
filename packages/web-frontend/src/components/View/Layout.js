/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import styled from 'styled-components';
import { isMobile } from '../../utils';

export const ChartContainer = styled.div(props =>
  isMobile()
    ? {
        height: props.$isExporting ? 500 : 201,
        textAlign: 'center',
        position: 'relative',
      }
    : {
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '100%',
        alignContent: 'stretch',
        alignItems: 'stretch',
      },
);

export const ChartViewContainer = styled.div(
  isMobile()
    ? {
        width: '100%',
        height: '100%',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      },
);
