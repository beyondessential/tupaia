import { Typography } from '@material-ui/core';
import React, { Fragment } from 'react';
import styled, { css } from 'styled-components';

import { ButtonLink as BaseButtonLink, ButtonAnchor } from '../../components';
import { ROUTES } from '../../constants';
import { useIsMobile } from '../../utils';

const TUPAIA_REDIRECT_URL = process.env.REACT_APP_TUPAIA_REDIRECT_URL || 'https://tupaia.org';

const SectionContainer = styled.section`
  align-items: flex-start;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 0.625rem;
  display: flex;
  grid-area: --surveySelect;
  justify-content: space-between;
  overflow: visible !important;
  padding: 1rem;
  position: relative;

  ${({ theme }) => {
    const { up } = theme.breakpoints;
    return css`
      ${up('md')} {
        margin-block-start: 1.9375rem;
      }
      ${up('lg')} {
        padding-inline: 2.2rem 3rem;
      }
    `;
  }}
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column-reverse;
  width: 70%;
  padding-inline-end: 2rem;

  ${({ theme }) => {
    const { up } = theme.breakpoints;
    return css`
      ${up('sm')} {
        margin-inline-start: 10%;
      }
      ${up('md')} {
        margin-inline-start: 0;
        flex-direction: row;
        width: 100%;
        align-items: center;
      }
    `;
  }} {
  }
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
  justify-content: space-between;
  text-align: center;
  max-width: 20rem;
  inline-size: 100%;
  ${({ theme }) => theme.breakpoints.up('md')} {
    inline-size: 11rem;
  }
  .MuiButton-root {
    line-height: 1.1;
    padding: 0.75rem;
    &:last-child {
      margin-block-start: 0.5rem;
    }
  }
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-block-end: 0.7rem;
  text-wrap: balance;

  ${({ theme }) => {
    const { up } = theme.breakpoints;
    return css`
      ${up('md')} {
        margin-block-end: 0;
        max-width: 75%;
        padding-inline: 1rem 4rem;
      }
      ${up('lg')} {
        padding-inline: 2rem 1rem;
      }
    `;
  }}
`;

const Text = styled(Typography)`
  ${({ theme }) => {
    const { up } = theme.breakpoints;
    return css`
      ${up('xs')} {
        line-height: 1.5;
        font-size: 0.9rem;
      }
      ${up('sm')} {
        font-size: 1rem;
      }
      ${up('md')} {
        font-size: 0.9rem;
      }
    `;
  }}
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
})`
  position: absolute;
  width: auto;
  display: flex;
  align-items: center;
  top: 50%;
  transform: translateY(-50%);
  right: 0;
  height: 130%;
  ${({ theme }) => {
    const { up } = theme.breakpoints;
    return css`
      ${up('sm')} {
        right: 10%;
        height: 125%;
      }
      ${up('md')} {
        right: -1rem;
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
