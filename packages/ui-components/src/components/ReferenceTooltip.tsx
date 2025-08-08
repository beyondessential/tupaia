import React from 'react';
import { Tooltip, Typography, withStyles } from '@material-ui/core';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import styled from 'styled-components';
import { LinkReferenceProps, PlaintextReferenceProps, ReferenceProps } from '@tupaia/types';
import { ValueOf } from '../types/helpers';

export const ICON_STYLES = {
  DEFAULT: 'default',
  MAP_OVERLAY: 'mapOverlay',
  TILE_SET: 'tileSet',
};
type IconStyle = ValueOf<typeof ICON_STYLES>;

type IconButtonProps = {
  $iconStyle: IconStyle;
};

const IconButton = styled(InfoRoundedIcon)<IconButtonProps>`
  color: rgba(255, 255, 255, 70%);
  font-size: ${({ $iconStyle }) => ($iconStyle === ICON_STYLES.MAP_OVERLAY ? '20px' : '16px')};
  margin-bottom: ${({ $iconStyle }) => ($iconStyle === ICON_STYLES.TILE_SET ? '-1px' : '0px')};
  margin-top: ${({ $iconStyle }) => ($iconStyle === ICON_STYLES.MAP_OVERLAY ? '3px' : '0px')};
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
}))(styled(Tooltip)`
  margin-inline: 0.5rem;
`);

export const isPlaintextReferenceProp = (obj: ReferenceProps): obj is PlaintextReferenceProps =>
  'text' in obj && !('name' in obj) && !('link' in obj);

const Content = (referenceProps: ReferenceProps) => {
  if (isPlaintextReferenceProp(referenceProps)) {
    return <TextCaption>{referenceProps.text}</TextCaption>;
  }

  // Type assertion below is redundant, but typing system doesn’t seem to pick it up when those
  // types are defined in another package
  const { name: sourceName, link: sourceUrl } = referenceProps as LinkReferenceProps;
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
  iconStyle?: IconStyle;
  reference: ReferenceProps;
}

/**
 * A special case of the Tooltip component, used to display supplementary text or link to a source
 * of data. When provided just a `text` property, it behaves much like the ui-components Tooltip;
 * when provided a `name` and `link`, it is shown as a named link to a data source.
 *
 * @remarks If the provided `reference` prop is nullish, then null is returned. Nothing is rendered.
 *
 * @param iconStyle
 * @param reference An object with either a string `text` value, or the `name` + `link` for a named
 * link. It must not contain both the `text` property and details for a named link.
 */
export const ReferenceTooltip = ({
  iconStyle = ICON_STYLES.DEFAULT,
  reference,
}: ReferenceTooltipProps) => {
  if (!reference) return null;

  return (
    <StyledToolTip
      arrow
      interactive
      placement="top"
      enterTouchDelay={50}
      title={<Content {...reference} />}
    >
      <IconButton $iconStyle={iconStyle} />
    </StyledToolTip>
  );
};
