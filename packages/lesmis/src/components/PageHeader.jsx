import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import MuiContainer from '@material-ui/core/Container';
import { Toolbar } from './Layout';
import { Breadcrumbs } from './Breadcrumbs';

const TitleContainer = styled.div`
  padding-top: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Title = styled(Typography)`
  font-weight: 600;
  font-size: 1.75rem;
  line-height: 2.6rem;
`;

export const PageHeader = ({ title, breadcrumbs, center }) => (
  <>
    <Toolbar>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
    </Toolbar>
    <TitleContainer style={{ textAlign: center ? 'center' : 'left' }}>
      <MuiContainer maxWidth="lg">
        <Title variant="h1">{title}</Title>
      </MuiContainer>
    </TitleContainer>
  </>
);

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string,
    }),
  ),
  center: PropTypes.bool,
};

PageHeader.defaultProps = {
  center: false,
  breadcrumbs: [],
};
