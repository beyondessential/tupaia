/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Link, Typography, List } from '@material-ui/core';
import { useCustomLandingPages } from './useCustomLandingPages';

const Footer = styled.footer`
  margin-top: auto;
  color: ${props => props.theme.palette.common.white};
  display: flex;
  flex-direction: column;
`;

const FooterContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  @media screen and (min-width: ${props => props.theme.breakpoints.values.md}px) {
    flex-direction: row;
  }
`;

const FooterHeader = styled(Typography)`
  font-size: 1.2em;
  font-weight: ${props => props.theme.typography.fontWeightBold};
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
  @media screen and (min-width: ${props => props.theme.breakpoints.values.md}px) {
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
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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

export const LandingPageFooter = () => {
  const { customLandingPageSettings } = useCustomLandingPages();
  const {
    longBio,
    name,
    includeNameInHeader,
    externalLink,
    phoneNumber,
    websiteUrl,
  } = customLandingPageSettings;
  // use h3 for footer item headers if there is already an h2 in the page (i.e. the name is h1, and the extended title is h2, else h2)
  const footerHeaderVariant = includeNameInHeader ? 'h3' : 'h2';
  return (
    <Footer>
      <FooterContentWrapper>
        <FooterContentContainer>
          <FooterHeader variant={footerHeaderVariant}>About {name}</FooterHeader>
          <FooterBodyText>
            {longBio}
            {externalLink && (
              <>
                &nbsp;
                <FooterLink href={externalLink} target="_blank">
                  Learn more
                </FooterLink>
              </>
            )}
          </FooterBodyText>
        </FooterContentContainer>
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
                <FooterLink href={websiteUrl} target="_blank">
                  {websiteUrl}
                </FooterLink>
              </FooterContactListItem>
            )}
          </FooterContactList>
        </FooterContentContainer>
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
