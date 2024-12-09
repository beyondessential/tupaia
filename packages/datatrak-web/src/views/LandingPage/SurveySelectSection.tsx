/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { ROUTES } from '../../constants';
import { Button, ButtonLink as BaseButtonLink } from '../../components';

const TUPAIA_REDIRECT_URL = process.env.REACT_APP_TUPAIA_REDIRECT_URL || 'https://tupaia.org';

const SectionContainer = styled.section`
  grid-area: surveySelect;
  background-color: ${({ theme }) => theme.palette.background.paper};

  padding: 1rem;
  display: flex;
  position: relative;
  align-items: flex-start;
  justify-content: space-between;
  overflow: visible !important;
  height: max-content;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-block-start: 1.3rem !important;
    border-radius: 0.625rem;
  }
  ${({ theme }) => theme.breakpoints.up('lg')} {
    padding: 1rem 3rem 1rem 2.2rem;
  }
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column-reverse;
  width: 70%;
  padding-inline-end: 2rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    flex-direction: row;
    width: 100%;
    align-items: center;
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
  width: 100%;
  max-width: 20rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    width: 11rem;
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
  margin-block-end: 0.7rem;
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-block-end: 0;
    max-width: 75%;
    padding-inline: 1rem 4rem;
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    padding-inline: 2rem 1rem;
    max-width: 80%;
  }
`;

const Text = styled(Typography)`
  ${({ theme }) => theme.breakpoints.up('xs')} {
    line-height: 1.5;
    font-size: 0.9rem;
  }

  ${({ theme }) => theme.breakpoints.up('sm')} {
    font-size: 1.2rem;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    font-size: 0.9rem;
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    font-size: 1.06rem;
  }
`;

const DesktopText = styled.span`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
`;

const SurveysImage = styled.img`
  position: absolute;
  width: auto;
  display: flex;
  align-items: center;
  top: 50%;
  transform: translateY(-50%);
  right: 0;
  height: 130%;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    right: 0;
    height: 125%;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    right: -1rem;
    height: 130%;
  }
  ${({ theme }) => theme.breakpoints.up('lg')} {
    height: 150%;
  }
`;

export const SurveySelectSection = () => {
  return (
    <SectionContainer>
      <SectionContent>
        <ButtonWrapper>
          <ButtonLink to={ROUTES.SURVEY_SELECT}>Select survey</ButtonLink>
          <Button variant="outlined" onClick={() => window.open(TUPAIA_REDIRECT_URL)}>
            Explore data
          </Button>
        </ButtonWrapper>
        <TextWrapper>
          <Text>
            Tupaia DataTrak makes data collection easy!
            <DesktopText>
              {' '}
              You can use Tupaia DataTrak to complete surveys (and collect coconuts!), share news,
              stories and information with the Tupaia community. To collect data offline, please
              download our mobile app, Tupaia MediTrak, from Google Play or the Apple App Store.
            </DesktopText>
          </Text>
        </TextWrapper>
      </SectionContent>
      <SurveysImage src="/surveys.svg" alt="Illustration of woman holding a tablet" />
    </SectionContainer>
  );
};
