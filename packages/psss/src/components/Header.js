/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { Link as RouterLink } from 'react-router-dom';
import MuiLink from '@material-ui/core/Link';
import { SaveAlt, LightOutlinedButton } from '@tupaia/ui-components';
import MuiAvatar from '@material-ui/core/Avatar';
import * as COLORS from '../theme/colors';

const HeaderMain = styled.header`
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
`;

const HeaderInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 190px;
  padding-bottom: 1.25rem;
`;

const HeaderBack = styled(MuiLink)`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: ${COLORS.WHITE};
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;

  svg {
    margin-right: 0.5rem;
  }
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled(MuiAvatar)`
  height: 5rem;
  width: 5rem;
  margin-right: 0.9rem;
`;

const H1 = props => <Typography {...props} variant="h1" component="h1" />;

const StyledH1 = styled(H1)`
  font-size: 2.8rem;
  line-height: 3.3rem;
`;

export const Header = ({ title, avatarUrl, back }) => {
  return (
    <HeaderMain>
      <MuiContainer maxWidth="lg">
        <HeaderInner>
          <div>
            {back && (
              <HeaderBack to={back.url} component={RouterLink}>
                <ArrowBack />
                Back to {back.title}
              </HeaderBack>
            )}
            <HeaderTitle>
              {avatarUrl && <Avatar src={avatarUrl} />}
              {avatarUrl ? <StyledH1>{title}</StyledH1> : <H1>{title}</H1>}
            </HeaderTitle>
          </div>
          <LightOutlinedButton startIcon={<SaveAlt />}>Export Data</LightOutlinedButton>
        </HeaderInner>
      </MuiContainer>
    </HeaderMain>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  back: PropTypes.shape({ title: PropTypes.string.isRequired, url: PropTypes.string.isRequired }),
};

Header.defaultProps = {
  avatarUrl: null,
  back: null,
};
