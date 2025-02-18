import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import React, { Fragment, useState } from 'react';
import { generatePath, useParams } from 'react-router-dom';
import styled, { css } from 'styled-components';
import DoneIcon from '@material-ui/icons/Done';

import { Tooltip } from '@tupaia/ui-components';

import { CopyIcon } from '../../../components';
import { ROUTES } from '../../../constants';
import { getAndroidVersion, infoToast } from '../../../utils';
import { useTheme } from '@material-ui/core';

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
`;

const StyledCopyIcon = styled(CopyIcon)`
  ${({ theme }) => {
    const { action, text } = theme.palette;
    return css`
      color: ${text.primary};
      ${StyledIconButton}:hover > & {
        color: ${action.hover};
      }
    `;
  }}
`;

const useCopyUrl = () => {
  const params = useParams();
  const path = generatePath(ROUTES.SURVEY, params);
  const link = `${window.location.origin}${path}`;

  const [didJustCopy, setDidJustCopy] = useState(false);

  const copyPageUrl = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setDidJustCopy(true);
      setTimeout(() => setDidJustCopy(false), 2000);

      // Android 12 (and newer) notifies the user when the clipboard is accessed
      // https://developer.android.com/privacy-and-security/risks/secure-clipboard-handling
      const androidVersion = getAndroidVersion();
      if (!androidVersion || androidVersion < 12) {
        infoToast('Page URL copied to clipboard', {
          persist: false,
          TransitionProps: { appear: true },
          hideCloseButton: true,
        });
      }
    } catch (err) {
      console.warn('Failed to copy page URL: ', err);
    }
  };

  return { copyPageUrl, didJustCopy };
};

interface CopyUrlButtonProps extends IconButtonProps {
  noTooltip?: boolean;
}
export const CopyUrlButton = ({ noTooltip = false, ...props }: CopyUrlButtonProps) => {
  const { copyPageUrl, didJustCopy } = useCopyUrl();
  const MaybeTooltip = noTooltip ? Fragment : StyledTooltip;

  return (
    <MaybeTooltip>
      <StyledIconButton aria-label="Copy URL to clipboard" onClick={copyPageUrl} {...props}>
        {didJustCopy ? (
          <DoneIcon htmlColor={useTheme().palette.success.main} />
        ) : (
          <StyledCopyIcon />
        )}
      </StyledIconButton>
    </MaybeTooltip>
  );
};
