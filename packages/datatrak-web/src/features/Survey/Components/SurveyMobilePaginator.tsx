/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useSurveyForm } from '../SurveyContext';
import { Button, CopyIcon, ShareIcon, ContentsIcon } from '../../../components';
import { useIsMobile } from '../../../utils';

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0.5rem;
  border-top: 1px solid ${props => props.theme.palette.divider};
`;

const CustomButton = styled(Button)`
  .MuiSvgIcon-root {
    font-size: 1rem;
  }
`;

export const SurveyMobilePaginator = () => {
  const { isLast, isReviewScreen, isResubmitReviewScreen } = useSurveyForm();
  const isMobile = useIsMobile();

  const getNextButtonText = () => {
    if (isReviewScreen) return 'Submit';
    if (isResubmitReviewScreen) return 'Resubmit';
    if (isLast) {
      return isMobile ? 'Review' : 'Review and submit';
    }
    return 'Next';
  };

  const nextButtonText = getNextButtonText();

  return (
    <FormActions>
      <CustomButton onClick="">
        <ContentsIcon />
      </CustomButton>
      <CustomButton onClick="">
        <ShareIcon />
      </CustomButton>
      <CustomButton onClick="">
        <CopyIcon />
      </CustomButton>
      <Button type="submit">{nextButtonText}</Button>
    </FormActions>
  );
};
