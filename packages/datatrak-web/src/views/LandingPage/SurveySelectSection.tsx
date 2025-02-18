import { Typography } from '@material-ui/core';
import React, { Fragment } from 'react';
import styled, { css } from 'styled-components';

import { ButtonLink as BaseButtonLink, ButtonAnchor } from '../../components';
import { ROUTES } from '../../constants';
import { useIsMobile } from '../../utils';

const TUPAIA_REDIRECT_URL = process.env.REACT_APP_TUPAIA_REDIRECT_URL || 'https://tupaia.org';

const SectionContainer = styled.section`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 0.625rem;
  display: flex;
  grid-area: --surveySelect;
  justify-content: space-between;
  overflow: visible !important;
  padding: 1rem;
  position: relative;

  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-block-start: 1.9375rem;
  }
`;

const SectionContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column-reverse;
  padding-inline-end: 2rem;
  ${({ theme }) => {
    const { up, down } = theme.breakpoints;
    return css`
      ${up('md')} {
        margin-inline-start: 0;
        flex-direction: row;
      }
      ${down('md')} {
        // Avoid collision with SurveysImage
        padding-inline-end: 6.5rem;
      }
    `;
  }}
`;

const ButtonLink = styled(BaseButtonLink)`
  font-size: 1rem;
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
  row-gap: 0.5rem;

  inline-size: 100%;
  ${({ theme }) => theme.breakpoints.up('md')} {
    inline-size: 11rem;
  }

  .MuiButton-root {
    line-height: 1.1;
    padding: 0.75rem;
  }
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-block-end: 0.7rem;

  ${({ theme }) => {
    const { up } = theme.breakpoints;
    return css`
      ${up('md')} {
        margin-block-end: 0;
        max-inline-size: 75%;
        padding-inline: 1rem 4rem;
      }
      ${up('lg')} {
        padding-inline: 2rem 1rem;
      }
    `;
  }}
`;

const Text = styled(Typography)`
  font-size: 1rem;
  line-height: 1.5;
`;

const VisuallyHidden = styled.span`
  &:not(:focus):not(:active) {
    border: 0;
    clip: rect(0 0 0 0);
    height: auto;
    margin: 0;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
`;

const SurveysImage = styled.img.attrs({
  'aria-hidden': true,
  src: '/surveys.svg',
  width: 108,
  height: 207,
})`
  height: 130%;
  width: auto;

  inset-block-start: 50%;
  inset-inline-end: 0;
  position: absolute;
  shape-margin: 1rem;
  shape-outside: url('/surveys.svg');
  transform: translateY(-50%);

  ${({ theme }) => {
    const { up } = theme.breakpoints;
    return css`
      ${up('sm')} {
        inset-inline-end: 10%;
        height: 125%;
      }
      ${up('md')} {
        inset-inline-end: -1rem;
        height: 130%;
      }
      ${up('lg')} {
        height: 150%;
      }
    `;
  }}
`;

export const SurveySelectSection = () => {
  const SupplementalText = useIsMobile() ? VisuallyHidden : Fragment;

  return (
    <SectionContainer>
      <SectionContent>
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
        <TextWrapper>
          <Text>
            Tupaia DataTrak makes data collection easy!
            <SupplementalText>
              {' '}
              You can use Tupaia DataTrak to complete surveys (and collect coconuts!), share news,
              stories and information with the Tupaia community. To collect data offline, please
              download our mobile app, Tupaia MediTrak, from Google Play or the Apple App Store.
            </SupplementalText>
          </Text>
        </TextWrapper>
      </SectionContent>
      <SurveysImage />
    </SectionContainer>
  );
};
