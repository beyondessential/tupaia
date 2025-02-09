import { Link as MuiLink, Typography } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.footer`
  background-color: ${({ theme }) => theme.palette.common.white};
  padding-bottom: env(safe-area-inset-bottom, 0);
`;

const Heading = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1.1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.palette.background.default};
  margin-block-end: 0.5rem;
`;

const ContentContainer = styled.div`
  padding: 1rem;
`;

const ContributeContainer = styled.div`
  background-color: ${({ theme }) => theme.palette.primary.main};
  ${Heading} {
    color: ${({ theme }) => theme.palette.common.white};
  }
`;

const List = styled.ul`
  color: ${({ theme }) => theme.palette.background.default};
  font-size: 1rem;
  padding-inline-start: 1rem;
`;

const Link = styled(MuiLink).attrs({
  target: '_blank',
  rel: 'noreferrer noopener',
})`
  color: inherit;
  text-decoration: underline;
`;

const ImageWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-block-start: 1rem;
`;

const AppLink = styled(Link)`
  & + & {
    margin-inline-start: 1rem;
  }
`;

const AppImage = styled.img`
  height: 2.5rem;
  width: auto;
`;

const AttributionText = styled(Typography)`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.palette.background.default};
  margin-block: 0.2rem;
`;

export const Footer = () => {
  return (
    <Wrapper>
      <ContentContainer>
        <Heading>Interested in learning more?</Heading>
        <List>
          <li>
            Learn more about <Link href="https://info.tupaia.org">the project</Link> and how Tupaia
            is crowd sourcing clinic data from around the world.
          </li>
          <li>
            Access free{' '}
            <Link href="http://info.tupaia.org/procurement/">Tupaia procurement resources.</Link>
          </li>
          <li>
            Discover the little-known (completely fake) country called{' '}
            <Link href="http://info.tupaia.org/demo-land/">Demo Land</Link>!
          </li>
        </List>
      </ContentContainer>
      <ContributeContainer>
        <ContentContainer>
          <Heading>Contribute to Tupaia</Heading>
          <Typography>
            Download the Tupaia app to survey clinics and help add more data to Tupaia.
          </Typography>
          <ImageWrapper>
            <AppLink href="https://itunes.apple.com/us/app/tupaia-meditrak/id1245053537">
              <AppImage alt="Download on the App Store" src="/images/app-store-badge.svg" />
            </AppLink>
            <AppLink href="https://play.google.com/store/apps/details?id=com.tupaiameditrak">
              <AppImage alt="Get it on Google Play" src="/images/google-play-badge.png" />
            </AppLink>
          </ImageWrapper>
        </ContentContainer>
      </ContributeContainer>
      <ContentContainer>
        <AttributionText>
          ©&nbsp;{new Date().getFullYear()}{' '}
          <Link href="https://bes.au">Beyond Essential Systems</Link>
        </AttributionText>
        <AttributionText>
          Map used on this site: ©&nbsp;
          <Link href="https://www.mapbox.com/about/maps">Mapbox</Link> ©&nbsp;
          <Link href="http://www.openstreetmap.org/copyright">OpenStreetMap</Link>
        </AttributionText>
      </ContentContainer>
    </Wrapper>
  );
};
