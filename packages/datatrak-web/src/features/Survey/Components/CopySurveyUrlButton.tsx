import IconButton from '@material-ui/core/IconButton';
import { OptionsObject } from 'notistack';
import React from 'react';
import { generatePath, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { Tooltip } from '@tupaia/ui-components';

import { CopyIcon } from '../../../components';
import { ROUTES } from '../../../constants';
import { getAndroidVersion, infoToast } from '../../../utils';

const StyledTooltip = styled(Tooltip)`
  text-align: center;
`;

const Button = styled(IconButton)`
  padding: 0;
  margin-left: 0.5rem;
  text-align: center;

  .MuiSvgIcon-root {
    color: ${({ theme }) => theme.palette.text.primary};
  }

  &:hover .MuiSvgIcon-root {
    color: ${({ theme }) => theme.palette.action.hover};
  }
`;

export const useCopySurveyUrl = ({ toastOptions = {} }: { toastOptions: OptionsObject }) => {
  const params = useParams();
  const path = generatePath(ROUTES.SURVEY, params);
  const link = `${window.location.origin}${path}`;

  return async () => {
    try {
      await navigator.clipboard.writeText(link);
      const androidVersion = getAndroidVersion();

      // Android 13 natively notifies the user when the clipboard is accessed
      // https://developer.android.com/privacy-and-security/risks/secure-clipboard-handling
      if (!androidVersion || androidVersion < 12) {
        infoToast('Page URL copied to clipboard', {
          persist: false,
          TransitionProps: { appear: true },
          hideCloseButton: true,
          ...toastOptions,
        });
      }
    } catch (err) {
      console.warn('Failed to copy page URL: ', err);
    }
  };
};

export const CopySurveyUrlButton = () => {
  const copyPageUrl = useCopySurveyUrl({
    toastOptions: {
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'right',
      },
    },
  });
  return (
    <StyledTooltip
      title={
        <>
          Share survey. Copy URL
          <br />
          to clipboard
        </>
      }
      arrow
      enterDelay={500}
      enterTouchDelay={500}
    >
      <Button aria-label="Copy URL to clipboard" onClick={copyPageUrl}>
        <CopyIcon />
      </Button>
    </StyledTooltip>
  );
};
