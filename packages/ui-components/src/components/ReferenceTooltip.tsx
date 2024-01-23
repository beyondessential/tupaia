/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
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
  color: rgba(255, 255, 255, 85%);
  font-size: ${({ $buttonType }) => ($buttonType === 'mapOverlay' ? '20px' : '16px')};
  margin-bottom: ${({ $buttonType }) => ($buttonType === 'tileSet' ? '-1px' : '0px')};
  margin-top: ${({ $buttonType }) => ($buttonType === 'mapOverlay' ? '3px' : '0px')};
  transition: color 0.2s ease;

  :hover {
    background-color: initial;
    color: white;
  }
`;

const TextCaption = styled(Typography).attrs({
  variant: 'caption',
})`
  background-color: ${({ theme }) => theme.palette.common.black};
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

interface PlaintextReferenceProps {
  text: string;
  name?: never;
  link?: never;
}
interface LinkReferenceProps {
  text?: never;
  name: string;
  link: string;
}

/**
 * Props for the reference prop of the ReferenceTooltip component. It can have either a piece of
 * plaintext to display in the tooltip, or a named link; but not both.
 */
export type ReferenceProps = PlaintextReferenceProps | LinkReferenceProps;

const isPlaintextReferenceProp = (obj: ReferenceProps): obj is PlaintextReferenceProps =>
  'text' in obj && !('name' in obj) && !('link' in obj);

const Content = (referenceProps: ReferenceProps) => {
  if (isPlaintextReferenceProp(referenceProps)) {
    return <TextCaption>{referenceProps.text}</TextCaption>;
  }

  const { name: sourceName, link: sourceUrl } = referenceProps;
  return (
    <TextCaption>
      Source:{' '}
      <Link href={sourceUrl} target="_blank" rel="noopener noreferrer">
        {sourceName}
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
  reference,
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
