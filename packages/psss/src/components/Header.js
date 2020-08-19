/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { Link as RouterLink } from 'react-router-dom';
import MuiLink from '@material-ui/core/Link';
import { SaveAlt, LightOutlinedButton } from '@tupaia/ui-components';
import MuiAvatar from '@material-ui/core/Avatar';
import { FlexSpaceBetween, FlexStart } from './Layout';
import * as COLORS from '../constants/colors';

const HeaderMain = styled.header`
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
`;

const HeaderInner = styled(FlexSpaceBetween)`
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

const Avatar = styled(MuiAvatar)`
  height: 5rem;
  width: 5rem;
  margin-right: 0.9rem;
`;

const H1 = props => <Typography {...props} variant="h1" component="h1" />;

const StyledH1 = styled(H1)`
  font-size: 2.8rem;
  line-height: 3.3rem;
  text-transform: capitalize;
`;

export const HeaderTitle = ({ title }) => <H1>{title}</H1>;

HeaderTitle.propTypes = {
  title: PropTypes.string.isRequired,
};

export const HeaderAvatarTitle = ({ title, avatarUrl }) => {
  return (
    <FlexStart>
      <Avatar src={avatarUrl} />
      <StyledH1>{title}</StyledH1>
    </FlexStart>
  );
};

HeaderAvatarTitle.propTypes = {
  title: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
};

HeaderAvatarTitle.defaultProps = {
  avatarUrl: null,
};

const SubHeading = styled(H1)`
  font-size: 1.3rem;
  line-height: 1.5rem;
  font-weight: 400;
`;

const SmallAvatar = styled(MuiAvatar)`
  height: 2.5rem;
  width: 2.5rem;
  margin-right: 0.8rem;
`;

const SubHeadingContainer = styled(FlexStart)`
  margin-bottom: 0.8rem;
`;

export const HeaderTitleWithSubHeading = ({ title, subHeading, avatarUrl }) => (
  <>
    <SubHeadingContainer>
      <SmallAvatar src={avatarUrl} />
      <SubHeading variant="h3">{subHeading}</SubHeading>
    </SubHeadingContainer>
    <HeaderTitle title={title} />
  </>
);

HeaderTitleWithSubHeading.propTypes = {
  title: PropTypes.string.isRequired,
  subHeading: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
};

HeaderTitleWithSubHeading.defaultProps = {
  avatarUrl: null,
};

export const Header = ({ Title, back, ExportModal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            {Title}
          </div>
          {ExportModal && (
            <>
              <LightOutlinedButton onClick={() => setIsModalOpen(true)} startIcon={<SaveAlt />}>
                Export Data
              </LightOutlinedButton>
              <ExportModal isOpen={isModalOpen} handleClose={() => setIsModalOpen(false)} />
            </>
          )}
        </HeaderInner>
      </MuiContainer>
    </HeaderMain>
  );
};

Header.propTypes = {
  Title: PropTypes.any.isRequired,
  back: PropTypes.shape({ title: PropTypes.string.isRequired, url: PropTypes.string.isRequired }),
  ExportModal: PropTypes.any,
};

Header.defaultProps = {
  back: null,
  ExportModal: null,
};
