/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import styled from 'styled-components';
import { isMobile } from '../../utils';

export const FlexStart = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const FlexEnd = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export const FlexSpaceBetween = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const FlexCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FlexRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

export const ChartContainer = styled.div(
  isMobile()
    ? {
        height: 200,
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
    ? {}
    : {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      },
);
