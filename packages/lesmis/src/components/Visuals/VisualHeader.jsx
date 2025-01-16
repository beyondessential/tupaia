import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { FlexSpaceBetween, FlexStart } from '../Layout';

const Header = styled(FlexSpaceBetween)`
  padding: 1.25rem 1.875rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  text-align: center;
`;

const Title = styled(Typography)`
  font-style: normal;
  font-weight: 500;
  font-size: 1.125rem;
  line-height: 1.3rem;
  margin-right: 1rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: ${props => 'auto '.repeat(props.$numberOfChildren)};
  gap: 17px;
`;

export const VisualHeader = ({ name, isLoading, children }) => {
  return (
    <Header>
      <FlexStart>
        <Title>{name}</Title>
        {isLoading && <CircularProgress size={30} />}
      </FlexStart>
      <GridContainer $numberOfChildren={children.length || 0}>{children}</GridContainer>
    </Header>
  );
};

VisualHeader.propTypes = {
  name: PropTypes.string,
  children: PropTypes.node,
  isLoading: PropTypes.bool,
};

VisualHeader.defaultProps = {
  name: PropTypes.null,
  isLoading: false,
  children: PropTypes.null,
};
