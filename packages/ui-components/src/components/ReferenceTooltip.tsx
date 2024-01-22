/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Tooltip, Typography, withStyles } from '@material-ui/core';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import styled from 'styled-components';

type ButtonType = 'default' | 'tileSet' | 'mapOverlay';

type ButtonProps = {
  $buttonType: ButtonType;
};

const IconButton = styled(InfoRoundedIcon)<ButtonProps>`
  font-size: ${({ $buttonType }) => ($buttonType === 'mapOverlay' ? '20px' : '16px')};
  margin-top: ${({ $buttonType }) => ($buttonType === 'mapOverlay' ? '3px' : '0px')};
  margin-bottom: ${({ $buttonType }) => ($buttonType === 'tileSet' ? '-1px' : '0px')};
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
  iconStyleOption?: ButtonType;
  reference?: ReferenceProps;
}

export const ReferenceTooltip = ({
  iconStyleOption = 'default',
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
