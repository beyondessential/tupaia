import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { Link as RouterLink } from 'react-router-dom';
import MuiLink from '@material-ui/core/Link';
import { SaveAlt, LightOutlinedButton, TupaiaIcon } from '@tupaia/ui-components';
import MuiAvatar from '@material-ui/core/Avatar';
import { FlexSpaceBetween, FlexStart } from './Layout';
import * as COLORS from '../constants/colors';

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

export const HeaderTitleWithSubHeading = ({ title, subHeading, avatarUrl }) => (
  <>
    <FlexStart mb={2}>
      <SmallAvatar src={avatarUrl} />
      <SubHeading variant="h3">{subHeading}</SubHeading>
    </FlexStart>
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

const TupaiaButton = styled(LightOutlinedButton)`
  .MuiButton-startIcon {
    height: 1rem;
    top: -2px;
    position: relative;
    width: 1.1rem;

    svg {
      font-size: 1.3rem;
    }
  }
`;

export const Header = ({ Title, back, ExportModal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <HeaderMain>
      <MuiContainer maxWidth="xl">
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
          <div>
            <TupaiaButton href="https://tupaia.org" startIcon={<TupaiaIcon />} target="_blank">
              View Tupaia
            </TupaiaButton>
            {ExportModal && (
              <>
                <LightOutlinedButton onClick={() => setIsModalOpen(true)} startIcon={<SaveAlt />}>
                  Export Data
                </LightOutlinedButton>
                <ExportModal isOpen={isModalOpen} handleClose={() => setIsModalOpen(false)} />
              </>
            )}
          </div>
        </HeaderInner>
      </MuiContainer>
    </HeaderMain>
  );
};

Header.propTypes = {
  Title: PropTypes.node.isRequired,
  back: PropTypes.shape({ title: PropTypes.string.isRequired, url: PropTypes.string.isRequired }),
  ExportModal: PropTypes.node,
};

Header.defaultProps = {
  back: null,
  ExportModal: null,
};
