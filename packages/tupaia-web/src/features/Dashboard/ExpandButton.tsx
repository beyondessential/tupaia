import React from 'react';
import styled from 'styled-components';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { Button } from '@tupaia/ui-components';

const SemiCircle = styled(Button)`
  position: absolute;
  top: 50%;
  left: -30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.palette.background.paper};
  min-height: 60px;
  min-width: 30px;
  border-top-left-radius: 60px;
  border-bottom-left-radius: 60px;
  cursor: pointer;
  padding: 0;

  &:hover {
    background-color: ${({ theme }) => theme.palette.background.paper};
  }
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
  return (
    <SemiCircle onClick={setIsExpanded} title={`${isExpanded ? 'Collapse' : 'Expand'} dashboard`}>
      {arrowIcon}
    </SemiCircle>
  );
};
