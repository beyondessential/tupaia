import React from 'react';
import styled from 'styled-components';
import { Link, Typography, List } from '@material-ui/core';
import { SingleLandingPage } from '../../types';
import { MOBILE_BREAKPOINT } from '../../constants';

const Footer = styled.footer`
  margin-top: auto;
  color: ${props => props.theme.palette.common.white};
  display: flex;
  flex-direction: column;
`;

const FooterContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    flex-direction: row;
  }
`;

const FooterHeader = styled(Typography)`
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 1em;
`;

const FooterBodyText = styled.p`
  margin: 0;
  font-size: 0.875em;
  @media screen and (min-width: ${({ theme }) =>
      theme.breakpoints.values.sm}px) and (min-height: 600px) {
    font-size: 1em;
  }
`;

const FooterLink = styled(Link)`
  color: ${props => props.theme.palette.common.white};
  text-decoration: underline;
`;

const FooterContentContainer = styled.div`
  & + & {
    margin-top: 1em;
  }
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    width: 30%;
    & + & {
      margin-left: 4em;
      margin-top: 0;
    }
  }
`;

const FooterContactList = styled(List)`
  list-style: none;
  padding: 0;
`;

const FooterContactListItem = styled.li`
  font-size: 0.875em;
  & + & {
    margin-top: 0.5em;
  }
  @media screen and (min-width: ${({ theme }) =>
      theme.breakpoints.values.sm}px) and (min-height: 600px) {
    font-size: 1em;
  }
`;

const FooterPoweredByWrapper = styled.div`
  margin-top: -2px;
  display: flex;
  justify-content: flex-end;
  padding-top: 1em;
  @media screen and (min-width: ${({ theme }) =>
      theme.breakpoints.values.sm}px) and (min-height: 600px) {
    padding-top: 2em;
    margin-top: -3px;
  }
`;

export const LandingPageFooter = ({ landingPage }: { landingPage: SingleLandingPage }) => {
  const { longBio, name, includeNameInHeader, externalLink, phoneNumber, websiteUrl } = landingPage;
  // use h3 for footer item headers if there is already an h2 in the page (i.e. the name is h1, and the extended title is h2, else h2)
  const footerHeaderVariant = includeNameInHeader ? 'h3' : 'h2';

  // Parse the url, because if the http(s) is not included, the link will not be assumed to be the current origin + the url
  const parseUrl = (url: string) => {
    if (url.includes('http')) return url;
    return `https://${url}`;
  };
  const hasAboutSection = longBio || externalLink;
  const hasContactSection = phoneNumber || websiteUrl;

  return (
    <Footer>
      <FooterContentWrapper>
        {hasAboutSection && (
          <FooterContentContainer>
            <FooterHeader variant={footerHeaderVariant}>About {name}</FooterHeader>
            <FooterBodyText>
              {longBio}
              {externalLink && (
                <>
                  &nbsp;
                  <FooterLink href={parseUrl(externalLink)} target="_blank">
                    Learn more
                  </FooterLink>
                </>
              )}
            </FooterBodyText>
          </FooterContentContainer>
        )}
        {hasContactSection && (
          <FooterContentContainer>
            <FooterHeader variant={footerHeaderVariant}>Contact us</FooterHeader>
            <FooterContactList>
              {phoneNumber && (
                <FooterContactListItem>
                  Ph: &nbsp;<FooterLink href={`tel:${phoneNumber}`}>{phoneNumber}</FooterLink>
                </FooterContactListItem>
              )}
              {websiteUrl && (
                <FooterContactListItem>
                  Website: &nbsp;
                  <FooterLink href={parseUrl(websiteUrl)} target="_blank">
                    {websiteUrl}
                  </FooterLink>
                </FooterContactListItem>
              )}
            </FooterContactList>
          </FooterContentContainer>
        )}
      </FooterContentWrapper>
      <FooterPoweredByWrapper>
        <FooterBodyText>
          Powered by &nbsp;
          <FooterLink href="https://tupaia.org" target="_blank">
            Tupaia
          </FooterLink>
        </FooterBodyText>
      </FooterPoweredByWrapper>
    </Footer>
  );
};
