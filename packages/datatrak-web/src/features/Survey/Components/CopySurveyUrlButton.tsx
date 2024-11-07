/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import { useParams, generatePath } from 'react-router-dom';
import { Tooltip } from '@tupaia/ui-components';
import styled from 'styled-components';
import { CopyIcon } from '../../../components';
import { successToast } from '../../../utils';
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

export const CopySurveyUrlButton = () => {
  const params = useParams();
  const path = generatePath(ROUTES.SURVEY, params);
  const link = `${window.location.origin}${path}`;

  const copyPageUrl = () => {
    try {
      navigator.clipboard.writeText(link);
      successToast('Page URL copied to clipboard');
    } catch (err) {
      console.warn('Failed to copy page url: ', err);
    }
  };
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
