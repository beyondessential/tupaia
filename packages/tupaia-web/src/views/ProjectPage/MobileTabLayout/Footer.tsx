import { Link as MuiLink, Typography } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.footer`
  background-color: ${({ theme }) => theme.palette.common.white};
`;

const Heading = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1.1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.palette.background.default};
  margin-bottom: 0.5rem;
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
  margin-top: 1rem;
`;

const AppLink = styled(Link)`
  max-width: 150px;
  height: auto;
  &:not(:last-child) {
    margin-right: 1rem;
  }
`;

const AppImage = styled.img.attrs({
  'aria-hidden': 'true', // hide this for screen readers because it isn't useful for them. Instead use the SRLinkText to announce the content
})`
  max-width: 100%;
`;

/** Screen reader text for the app store links */
const SRLinkText = styled.span`
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

const AttributionText = styled(Typography)`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.palette.background.default};
  margin: 0.2rem 0;
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
              <AppImage src="/images/app-store-button.png" alt="Apple app store logo" />
              <SRLinkText>Download on the App Store</SRLinkText>
            </AppLink>
            <AppLink href="https://play.google.com/store/apps/details?id=com.tupaiameditrak">
              <AppImage src="/images/play-store-button.png" alt="Google play store logo" />
              <SRLinkText>Download on the Play Store</SRLinkText>
            </AppLink>
          </ImageWrapper>
        </ContentContainer>
      </ContributeContainer>
      <ContentContainer>
        <AttributionText>© 2017 Beyond Essential Systems</AttributionText>
        <AttributionText>
          Map used on this site: © <Link href="https://www.mapbox.com/about/maps/">Mapbox</Link> ©{' '}
          <Link href="http://www.openstreetmap.org/copyright">OpenStreetMap</Link>
        </AttributionText>
      </ContentContainer>
    </Wrapper>
  );
};
