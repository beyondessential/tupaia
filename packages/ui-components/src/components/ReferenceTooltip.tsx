/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Typography, Tooltip, withStyles } from '@material-ui/core';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import styled from 'styled-components';

const DEFAULT = 'default';
const TILE_SET = 'tileSet';
const MAP_OVERLAY = 'mayOverlay';

type ButtonProps = {
  $buttonType: string;
};

const IconButton = styled(InfoRoundedIcon)<ButtonProps>`
  font-size: ${({ $buttonType }) => ($buttonType === MAP_OVERLAY ? '20px' : '16px')};
  margin-top: ${({ $buttonType }) => ($buttonType === MAP_OVERLAY ? '3px' : '0px')};
  margin-bottom: ${({ $buttonType }) => ($buttonType === TILE_SET ? '-1px' : '0px')};
  color: grey;
  transition: color 0.2s ease;

  &:hover {
    background-color: initial;
    color: white;
  }
`;

const TextCaption = styled(Typography)`
  background-color: black;
`;

const Link = styled.a`
  color: #22c7fc;
`;

const StyledToolTip = withStyles(theme => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
  },
}))(Tooltip);

export interface ReferenceProps {
  text?: string;
  name?: string;
  link?: string;
}

const Content = ({ text = '', name = '', link = '' }: ReferenceProps) => {
  if (text) {
    return (
      <TextCaption variant="caption">
        <span>{text} </span>
      </TextCaption>
    );
  }
  return (
    <TextCaption variant="caption">
      <span>Source: </span>
      <Link href={link} target="_blank" rel="noopener noreferrer">
        {name}
      </Link>
    </TextCaption>
  );
};

interface ReferenceTooltipProps {
  iconStyleOption?: string;
  reference?: ReferenceProps;
}

export const ReferenceTooltip = ({
  iconStyleOption = DEFAULT,
  reference = {},
}: ReferenceTooltipProps) => {
  return (
    <StyledToolTip
      arrow
      interactive
      placement="top"
      enterTouchDelay={50}
      title={<Content {...reference} />}
    >
      <IconButton $buttonType={iconStyleOption} />
    </StyledToolTip>
  );
};
