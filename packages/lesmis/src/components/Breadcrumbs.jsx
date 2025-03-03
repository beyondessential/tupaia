import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Skeleton from '@material-ui/lab/Skeleton';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import MuiLink from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';
import { useHomeUrl, I18n } from '../utils';

const StyledBreadcrumbs = styled(MuiBreadcrumbs)`
  font-size: 0.75rem;
  line-height: 0.875rem;
  text-transform: capitalize;

  .MuiBreadcrumbs-separator {
    margin-left: 0.2rem;
    margin-right: 0.3rem;

    svg {
      font-size: 0.75rem;
    }
  }
`;

const ActiveSegment = styled.span`
  color: ${props => props.theme.palette.primary.main};
`;

const Loader = () => (
  <Skeleton animation="wave">
    <MuiLink>breadcrumbsLoading</MuiLink>
  </Skeleton>
);

const Link = props => <MuiLink color="inherit" {...props} component={RouterLink} />;

export const Breadcrumbs = ({ isLoading, breadcrumbs }) => {
  const { homeUrl } = useHomeUrl();

  return (
    <StyledBreadcrumbs separator={<NavigateNextIcon />}>
      <Link to={homeUrl}>
        <I18n t="home.home" />
      </Link>
      {isLoading ? (
        <Loader />
      ) : (
        breadcrumbs.map(({ name, url }, index) => {
          const last = index === breadcrumbs.length - 1;
          return last ? (
            <ActiveSegment key={url}>{name}</ActiveSegment>
          ) : (
            <Link to={url} key={url}>
              {name}
            </Link>
          );
        })
      )}
    </StyledBreadcrumbs>
  );
};

Breadcrumbs.propTypes = {
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string,
    }),
  ).isRequired,
  isLoading: PropTypes.bool,
};

Breadcrumbs.defaultProps = {
  isLoading: false,
};
