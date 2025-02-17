import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import React, { Fragment } from 'react';
import { generatePath, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { Tooltip } from '@tupaia/ui-components';

import { CopyIcon } from '../../../components';
import { ROUTES } from '../../../constants';
import { getAndroidVersion, infoToast } from '../../../utils';

const StyledTooltip = styled(Tooltip).attrs({
  arrow: true,
  enterDelay: 500,
  enterTouchDelay: 500,
  title: 'Share survey. Copy URL to clipboard',
})`
  text-align: center;
  text-wrap: balance;
`;

const StyledIconButton = styled(IconButton)`
  padding: 0;
  text-align: center;

  .MuiSvgIcon-root {
    color: ${({ theme }) => theme.palette.text.primary};
  }

  &:hover .MuiSvgIcon-root {
    color: ${({ theme }) => theme.palette.action.hover};
  }
`;

const useCopyUrl = () => {
  const params = useParams();
  const path = generatePath(ROUTES.SURVEY, params);
  const link = `${window.location.origin}${path}`;

  return async () => {
    try {
      await navigator.clipboard.writeText(link);
      const androidVersion = getAndroidVersion();

      // Android 12 (and newer) notifies the user when the clipboard is accessed
      // https://developer.android.com/privacy-and-security/risks/secure-clipboard-handling
      if (!androidVersion || androidVersion < 12) {
        infoToast(`Copied to clipboard:\n${link}`, {
          persist: false,
          TransitionProps: { appear: true },
          hideCloseButton: true,
        });
      }
    } catch (err) {
      console.warn('Failed to copy page URL: ', err);
    }
  };
};

interface CopyUrlButtonProps extends IconButtonProps {
  noTooltip?: boolean;
}
export const CopyUrlButton = ({ noTooltip = false, ...props }: CopyUrlButtonProps) => {
  const copyPageUrl = useCopyUrl();
  const MaybeTooltip = noTooltip ? Fragment : StyledTooltip;

  return (
    <MaybeTooltip>
      <StyledIconButton aria-label="Copy URL to clipboard" onClick={copyPageUrl} {...props}>
        <CopyIcon />
      </StyledIconButton>
    </MaybeTooltip>
  );
};
