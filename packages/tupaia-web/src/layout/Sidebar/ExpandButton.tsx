/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { TRANSPARENT_BLACK } from '../../constants';

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
  z-index: 400; // to show over the map
`;

const CloseArrowIcon = styled(KeyboardArrowRight)`
  margin-left: 5px;
`;

const OpenArrowIcon = styled(KeyboardArrowLeft)`
  margin-left: 5px;
`;

interface ExpandButtonProps {
  isExpanded: boolean;
  setIsExpanded: () => void;
}

export const ExpandButton = ({ isExpanded, setIsExpanded }: ExpandButtonProps) => {
  const arrowIcon = isExpanded ? <CloseArrowIcon /> : <OpenArrowIcon />;
  return <SemiCircle onClick={setIsExpanded}>{arrowIcon}</SemiCircle>;
};
