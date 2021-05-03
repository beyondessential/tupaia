/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { MuiThemeProvider } from '@material-ui/core/styles';
import MuiLink from '@material-ui/core/Link';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Typography from '@material-ui/core/Typography';
import MuiContainer from '@material-ui/core/Container';
import { Breadcrumbs, Toolbar } from '../components';
import * as COLORS from '../constants';
import { contentPageTheme } from '../theme';

const Container = styled(MuiContainer)`
  max-width: 48rem;
`;

const TemplateBody = styled.section`
  background: ${COLORS.GREY_F9};
  padding-top: 3rem;
  padding-bottom: 3rem;
  min-height: 800px; // fallback height for older browsers
  min-height: 70vh;
`;

const TitleContainer = styled.section`
  padding-top: 2rem;
  padding-bottom: 2rem;
  text-align: center;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Title = styled(Typography)`
  font-weight: 600;
  font-size: 1.75rem;
  line-height: 2.6rem;
`;

/* eslint-disable react/prop-types */
const PageHeader = ({ title, url }) => {
  const breadcrumbs = [{ name: title, url }];
  return (
    <>
      <Toolbar>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </Toolbar>
      <TitleContainer>
        <Title variant="h1">{title}</Title>
      </TitleContainer>
    </>
  );
};

export const PageView = ({ content }) => {
  const { title, body, url } = content;
  return (
    <>
      <PageHeader title={title} url={url} />
      <MuiThemeProvider theme={contentPageTheme}>
        <TemplateBody>
          <Container>{body}</Container>
        </TemplateBody>
      </MuiThemeProvider>
    </>
  );
};

PageView.propTypes = {
  content: PropTypes.shape({
    title: PropTypes.string,
    body: PropTypes.node,
    url: PropTypes.string,
  }).isRequired,
};

const TwoColumnContainer = styled(MuiContainer)`
  display: flex;
  max-width: 1200px;
`;

const LeftCol = styled(Container)`
  padding-right: 48px;
`;

const RightCol = styled.div`
  flex: 1;
`;

const Card = styled.div`
  background: white;
  border-radius: 3px;
  margin-bottom: 30px;
`;

const CardHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const CardBody = styled.div`
  padding: 20px 20px 8px;
`;

const Link = styled(MuiLink)`
  display: flex;
  align-items: center;
  margin-bottom: 19px;

  svg {
    font-size: 16px;
    margin-right: 6px;
  }
`;

export const TwoColumnPageView = ({ content }) => {
  const { title, body, url, linkSections } = content;
  return (
    <>
      <PageHeader title={title} url={url} />
      <MuiThemeProvider theme={contentPageTheme}>
        <TemplateBody>
          <TwoColumnContainer>
            <LeftCol>{body}</LeftCol>
            <RightCol>
              {linkSections.map(({ heading, links }) => (
                <Card>
                  <CardHeader>
                    <Typography variant="h3">{heading}</Typography>
                  </CardHeader>
                  <CardBody>
                    {links.map(({ name, link }) => (
                      <Link href={link}>
                        <ArrowForwardIcon />
                        {name}
                      </Link>
                    ))}
                  </CardBody>
                </Card>
              ))}
            </RightCol>
          </TwoColumnContainer>
        </TemplateBody>
      </MuiThemeProvider>
    </>
  );
};

TwoColumnPageView.propTypes = {
  content: PropTypes.shape({
    title: PropTypes.string,
    body: PropTypes.node,
    url: PropTypes.string,
    linkSections: PropTypes.array,
  }).isRequired,
};
