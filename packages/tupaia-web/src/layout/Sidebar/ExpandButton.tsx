/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import styled from 'styled-components';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { TRANSPARENT_BLACK } from '../../theme';
import { SIDEBAR_ACTION_TYPES, SidebarContext, SidebarDispatchContext } from '../../context';

const SemiCircle = styled.div`
  position: absolute;
  top: 50%;
  left: -30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${TRANSPARENT_BLACK};
  min-height: 60px;
  min-width: 30px;
  border-top-left-radius: 60px;
  border-bottom-left-radius: 60px;
  cursor: pointer;
  pointer-events: auto;
`;

const CloseArrowIcon = styled(KeyboardArrowRight)`
  margin-left: 5px;
`;

const OpenArrowIcon = styled(KeyboardArrowLeft)`
  margin-left: 5px;
`;

export const ExpandButton = () => {
  const { isExpanded } = useContext(SidebarContext);
  const dispatch = useContext(SidebarDispatchContext);

  const toggleExpanded = () => {
    dispatch({
      type: SIDEBAR_ACTION_TYPES.TOGGLE,
      payload: {
        isExpanded: !isExpanded,
      },
    });
  };
  const arrowIcon = isExpanded ? <CloseArrowIcon /> : <OpenArrowIcon />;
  return <SemiCircle onClick={toggleExpanded}>{arrowIcon}</SemiCircle>;
};
