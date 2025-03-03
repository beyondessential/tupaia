import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { MuiThemeProvider } from '@material-ui/core/styles';
import MuiLink from '@material-ui/core/Link';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Typography from '@material-ui/core/Typography';
import MuiContainer from '@material-ui/core/Container';
import { PageHeader } from '../components';
import * as COLORS from '../constants';
import { DEFAULT_LOCALE } from '../constants';
import { contentPageTheme } from '../theme';
import { useUrlParams } from '../utils';

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

const useTranslatedPageContent = pageContent => {
  const { locale } = useUrlParams();
  if (pageContent[locale]) {
    return pageContent[locale];
  }
  return pageContent[DEFAULT_LOCALE];
};

export const PageView = ({ content }) => {
  const { title, body, url } = useTranslatedPageContent(content);
  const { locale } = useUrlParams();
  const link = `/${locale}/${url}`;
  return (
    <>
      <PageHeader title={title} breadcrumbs={[{ name: title, url: link }]} center />
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
  max-width: 75rem;
`;

const LeftCol = styled(Container)`
  padding-right: 3rem;
`;

const RightCol = styled.div`
  flex: 1;
`;

const Card = styled.div`
  background: white;
  border-radius: 3px;
  margin-bottom: 1.875rem;
`;

const CardHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const CardBody = styled.div`
  padding: 1.25rem 1.25rem 0.5rem;
`;

const Link = styled(MuiLink)`
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;

  svg {
    font-size: 1rem;
    margin-right: 0.3rem;
  }
`;

export const TwoColumnPageView = ({ content }) => {
  const { title, body, url, linkSections } = useTranslatedPageContent(content);

  return (
    <>
      <PageHeader title={title} breadcrumbs={[{ name: title, url }]} />
      <MuiThemeProvider theme={contentPageTheme}>
        <TemplateBody>
          <TwoColumnContainer>
            <LeftCol>{body}</LeftCol>
            <RightCol>
              {linkSections.map(({ heading, links }) => (
                <Card key={heading}>
                  <CardHeader>
                    <Typography variant="h3">{heading}</Typography>
                  </CardHeader>
                  <CardBody>
                    {links.map(({ name, link }) => (
                      <Link key={name} href={link} target="_blank">
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
