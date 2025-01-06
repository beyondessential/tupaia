/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import { useParams, generatePath } from 'react-router-dom';
import { Tooltip } from '@tupaia/ui-components';
import styled from 'styled-components';
import { OptionsObject } from 'notistack';
import { CopyIcon } from '../../../components';
import { getAndroidVersion, infoToast, isAndroidDevice } from '../../../utils';
import { ROUTES } from '../../../constants';

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

  return () => {
    try {
      navigator.clipboard.writeText(link);

      const androidVersion = getAndroidVersion();

      // https://developer.android.com/develop/ui/views/touch-and-input/copy-paste#Feedback
      // Android 13 and above will automatically show a toast message when the page URL is copied to the clipboard
      if (!androidVersion || androidVersion < 13) {
        infoToast('Page URL copied to clipboard', {
          persist: false,
          TransitionProps: { appear: true },
          hideCloseButton: true,
          ...toastOptions,
        });
      }
    } catch (err) {
      console.warn('Failed to copy page url: ', err);
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
      <Button aria-label="copy url to clipboard" onClick={copyPageUrl}>
        <CopyIcon />
      </Button>
    </StyledTooltip>
  );
};
