import { Typography, useMediaQuery, useTheme } from '@material-ui/core';
import React, { Fragment } from 'react';
import styled from 'styled-components';

import { VisuallyHidden } from '@tupaia/ui-components';

import { ButtonLink as BaseButtonLink, ButtonAnchor } from '../../components';
import { ROUTES } from '../../constants';
import { useIsMobile } from '../../utils';

const TUPAIA_REDIRECT_URL = process.env.REACT_APP_TUPAIA_REDIRECT_URL || 'https://tupaia.org';

const SectionContainer = styled.section`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 0.625rem;
  column-gap: 1rem;
  display: flex;
  font-size: 1rem;
  grid-area: --surveySelect;
  justify-content: space-between;
  overflow: visible !important;
  padding: 1rem;

  // HACK: Parent’s grid-template-rows currently defined in a way that causes horizontal track to
  // sometimes shrink smaller than this element. The 4lh is just empirically hand-tuned. 2em is the
  // block padding.
  min-block-size: calc(4lh + 2rem);

  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-block-start: 1.9375rem;
  }
`;

const ButtonLink = styled(BaseButtonLink)`
  font-size: inherit;
  padding-inline: 0.5rem;
  & ~ .MuiButtonBase-root {
    margin-inline-start: 0; // override default margin from ui-components
  }
  &:last-child {
    margin-block-start: 1rem;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-inline-size: 20rem;
  min-inline-size: 8rem;
  row-gap: 0.5rem;
  text-align: center;

  inline-size: 100%;
  ${({ theme }) => theme.breakpoints.up('md')} {
    inline-size: 11rem;
  }

  .MuiButton-root {
    line-height: 1.1;
    padding: 0.75rem;
  }
`;

const Text = styled(Typography)`
  font-size: inherit;
  line-height: 1.5;
  max-inline-size: 38rem;
`;

/**
 * Semantically meaningless, but using this to let `SurveysImage` overflow without the containing
 * flexbox without increasing its height.
 */
const ImageWrapper = styled.div.attrs({ 'aria-hidden': true })`
  // Center children, even if overflowing
  align-items: center;
  display: flex;
  justify-content: center;
  overflow: visible;

  height: 0; // Let siblings alone determine height of parent...
  width: fit-content; // ...but accommodate entire image width.

  flex: 1;

  @media (max-width: 20rem) {
    display: none;
  }
`;

const SurveysImage = styled.img.attrs({
  'aria-hidden': true,
  src: '/surveys.svg',
  width: 108,
  height: 207,
})`
  height: 12rem;
  width: auto;
`;

export const SurveySelectSection = () => {
  const isMobile = useIsMobile();
  const verbose = useMediaQuery(useTheme().breakpoints.up('lg'));
  const SupplementalText = verbose ? Fragment : VisuallyHidden;

  return (
    <SectionContainer>
      {!isMobile && (
        <ButtonWrapper>
          <ButtonLink to={ROUTES.SURVEY_SELECT}>Select survey</ButtonLink>
          <ButtonAnchor
            fullWidth
            variant="outlined"
            href={TUPAIA_REDIRECT_URL}
            rel="noreferrer"
            target="_blank"
          >
            Explore data
          </ButtonAnchor>
        </ButtonWrapper>
      )}
      <Text>
        Tupaia DataTrak makes data collection easy!
        <SupplementalText>
          {' '}
          You can use Tupaia DataTrak to complete surveys (and collect coconuts!), share news,
          stories and information with the Tupaia community.
        </SupplementalText>
      </Text>
      <ImageWrapper>
        <SurveysImage />
      </ImageWrapper>
    </SectionContainer>
  );
};
