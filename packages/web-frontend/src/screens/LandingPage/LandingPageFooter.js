import React from 'react';
import styled from 'styled-components';
import { Link, Typography } from '@material-ui/core';
import { List } from 'material-ui';
import { useCustomLandingPages } from './useCustomLandingPages';

const FooterHeader = styled(Typography)`
  font-size: 1.2em;
  font-weight: ${props => props.theme.typography.fontWeightBold};
`;
const Footer = styled.div`
  color: ${props => props.theme.palette.common.white};
  display: flex;
`;
const FooterBodyText = styled.p`
  margin-bottom: 0;
`;

const FooterLink = styled(Link)`
  color: ${props => props.theme.palette.common.white};
  text-decoration: underline;
`;

const FooterContentWrapper = styled.div`
  & + & {
    margin-left: 4em;
  }
  @media screen and (min-width: ${props => props.theme.breakpoints.values.md}px) {
    width: 30%;
  }
`;

const FooterContactList = styled(List)`
  list-style: none;
`;

const FooterContactListItem = styled.li`
  & + & {
    margin-top: 0.5em;
  }
`;

export const LandingPageFooter = () => {
  const { customLandingPageSettings } = useCustomLandingPages();
  const {
    long_bio: longBio,
    name,
    include_name_in_header: includeNameInHeader,
    external_link: externalLink,
    phone_number: phoneNumber,
    website_url: websiteUrl,
  } = customLandingPageSettings;
  // use h3 for footer item headers if there is already an h2 in the page (i.e. the name is h1, and the extended title is h2, else h2)
  const footerHeaderVariant = includeNameInHeader ? 'h3' : 'h2';
  return (
    <Footer>
      <FooterContentWrapper>
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
      </FooterContentWrapper>
      <FooterContentWrapper>
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
      </FooterContentWrapper>
    </Footer>
  );
};
