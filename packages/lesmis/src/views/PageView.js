/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import MuiContainer from '@material-ui/core/Container';
import { Breadcrumbs, Toolbar } from '../components';
import * as COLORS from '../constants';
import { contentPageTheme } from '../theme';

const TemplateBody = styled.section`
  background: ${COLORS.GREY_F9};
  padding-top: 3rem;
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
  font-size: 28px;
  line-height: 42px;
`;

export const PageView = ({ content }) => {
  const { title, body, urlSegment } = content;
  const breadcrumbs = [{ name: title, code: urlSegment }];

  return (
    <MuiThemeProvider theme={contentPageTheme}>
      <Toolbar>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </Toolbar>
      <TitleContainer>
        <Title variant="h1">{title}</Title>
      </TitleContainer>
      <TemplateBody>
        <MuiContainer maxWidth="md">{body}</MuiContainer>
      </TemplateBody>
    </MuiThemeProvider>
  );
};

PageView.propTypes = {
  content: PropTypes.shape({
    title: PropTypes.string,
    body: PropTypes.string,
    urlSegment: PropTypes.string,
  }).isRequired,
};
