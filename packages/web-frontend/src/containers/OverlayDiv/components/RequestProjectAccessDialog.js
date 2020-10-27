/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Component for Project Access Form
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import MuiDivider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import ExploreIcon from '@material-ui/icons/ExploreOutlined';
import { Typography } from '@material-ui/core';

import { Alert } from '../../../components/Alert';
import { Form } from '../../Form';
import { SubmitButton } from '../../Form/common';
import { PrimaryButton } from '../../../components/Buttons';
import { TextField, CheckboxField } from '../../Form/Fields';
import { aggregateFields } from '../../Form/utils';
import { attemptRequestCountryAccess, setOverlayComponent, closeUserPage } from '../../../actions';
import { LANDING } from '../constants';
import { TUPAIA_LIGHT_LOGO_SRC } from '../../../constants';

const leftPadding = '40px';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 30px 30px ${leftPadding};
  text-align: left;
`;

const Logo = styled.img`
  width: 106px;
  height: 46px;
`;

const TagLine = styled(Typography)`
  width: 206px;
  font-size: 12px;
  line-height: 18px;
`;

const ExploreButton = styled(Button)`
  margin-bottom: 16px;
  width: 225px;
  height: 50px;
  border-radius: 3px;
  font-size: 12px;

  svg {
    margin-right: 10px;
  }
`;

const Title = styled(Typography)`
  text-align: left;
  background-color: rgba(0, 0, 0, 0.2);
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  padding: 16px 30px 16px ${leftPadding};
`;

const Heading = styled(Typography)`
  font-weight: bold;
  font-size: 21px;
  line-height: 24px;
  margin-bottom: 5px;
`;

const SubHeading = styled(Typography)`
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 10px;
`;

const Countries = styled(Typography)`
  margin-bottom: 16px;
  font-size: 14px;
  opacity: 0.7;
  text-transform: uppercase;
`;

const Divider = styled(MuiDivider)`
  margin: 20px 0;
`;

const ProjectBody = styled.div`
  padding: 36px 30px 40px ${leftPadding};
  text-align: left;
  max-width: 640px;
`;

const HeroImage = styled.div`
  width: 100%;
  height: 240px;
  background-image: ${({ src }) => `url(${src})`};
  position: relative;
  background-size: cover;
`;

const LogoImage = styled.div`
  position: absolute;
  width: 130px;
  height: 75px;
  background-color: #ffffff;
  background-image: ${({ src }) => `url(${src})`};
  background-repeat: no-repeat;
  background-position: center;
  bottom: -30px;
  right: 40px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.25);
  border-radius: 3px;
  overflow: hidden;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const BackButton = styled(PrimaryButton)`
  margin-top: 30px;
  margin-bottom: 10px;
`;

export const RequestProjectAccessComponent = React.memo(
  ({
    project,
    countries,
    onBackToProjects,
    onAttemptRequestProjectAccess,
    isLoading,
    success,
    errorMessage,
  }) => (
    <>
      <Header>
        <div>
          <Logo src={TUPAIA_LIGHT_LOGO_SRC} alt="Tupaia logo" />
          <TagLine>Health resource and supply chain mapping for the Asia Pacific region</TagLine>
        </div>
        <ExploreButton onClick={onBackToProjects} variant="outlined">
          <ExploreIcon />
          &nbsp; View other projects
        </ExploreButton>
      </Header>
      <Title>Requesting Project Access</Title>
      <HeroImage src={project.imageUrl}>
        <LogoImage src={project.logoUrl} />
      </HeroImage>
      <ProjectBody>
        <Heading>{project.name}</Heading>
        <SubHeading>{project.description}</SubHeading>
        {project.names && <Countries>{project.names.join(', ')}</Countries>}
        <Divider />
        {success ? (
          <>
            <Alert severity="success">
              Thank you for your access request to {project.name}. We will review your application
              and respond by email shortly.
            </Alert>
            <BackButton onClick={onBackToProjects}>Back to Projects</BackButton>
          </>
        ) : (
          <Form
            isLoading={isLoading}
            formError={errorMessage}
            onSubmit={fieldValues =>
              onAttemptRequestProjectAccess(
                aggregateFields({ ...fieldValues, projectCode: project.code }),
              )
            }
            GridComponent={FormGrid}
            render={submitForm => (
              <>
                {countries.map(country => (
                  <CheckboxField
                    label={country.name}
                    key={country.id}
                    name={`entityIds.${country.id}`}
                  />
                ))}
                <TextField
                  label="Why would you like access to this project?"
                  name="message"
                  multiline
                  rows="4"
                  fullWidth
                />
                <SubmitButton type="submit" handleClick={submitForm} gutterTop>
                  Request access
                </SubmitButton>
              </>
            )}
          />
        )}
      </ProjectBody>
    </>
  ),
);

RequestProjectAccessComponent.propTypes = {
  project: PropTypes.shape({
    name: PropTypes.string,
    code: PropTypes.string,
    imageUrl: PropTypes.string,
    logoUrl: PropTypes.string,
    names: PropTypes.array,
    description: PropTypes.string,
  }).isRequired,
  countries: PropTypes.arrayOf(PropTypes.object).isRequired,
  errorMessage: PropTypes.string.isRequired,
  onBackToProjects: PropTypes.func.isRequired,
  onAttemptRequestProjectAccess: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  success: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
  const { requestingAccess } = state.project;
  const {
    countries,
    isFetchingCountryAccessData,
    isRequestingCountryAccess,
    hasRequestCountryAccessCompleted,
    errorMessage,
  } = state.requestCountryAccess;

  return {
    project: requestingAccess,
    countries: countries.filter(c => requestingAccess.names.includes(c.name)),
    isRequestingCountryAccess,
    isLoading: isFetchingCountryAccessData || isRequestingCountryAccess,
    success: hasRequestCountryAccessCompleted,
    errorMessage,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAttemptRequestProjectAccess: ({ entityIds, message, projectCode }) =>
      dispatch(attemptRequestCountryAccess(entityIds, message, projectCode)),
    onBackToProjects: () => {
      dispatch(setOverlayComponent(LANDING));
      dispatch(closeUserPage());
    },
  };
};

export const RequestProjectAccessDialog = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RequestProjectAccessComponent);
