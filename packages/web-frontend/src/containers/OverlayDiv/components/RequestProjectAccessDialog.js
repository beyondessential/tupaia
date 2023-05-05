/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
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
import {
  attemptRequestCountryAccess,
  setRequestingAdditionalCountryAccess,
  setOverlayComponent,
  closeUserPage,
} from '../../../actions';
import { LANDING } from '../constants';
import { TUPAIA_LIGHT_LOGO_SRC } from '../../../constants';
import { BLUE, WHITE, GREY } from '../../../styles';

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
  max-width: 100%;
  max-height: 100%;
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

  @media (min-width: 600px) {
    min-width: 500px;
  }
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
  background-size: contain;
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

const Note = styled.p`
  text-align: left;
  color: ${GREY};
  font-size: small;
`;

const BackButton = styled(PrimaryButton)`
  margin-top: 30px;
  margin-bottom: 10px;
  width: 220px;
`;

const RequestLink = styled.a`
  color: ${BLUE};
  white-space: nowrap;
  outline: none;
  text-decoration: underline;
  text-align: left;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
`;

const RequestedProjectCountriesList = styled.div`
  text-align: left;
  margin-left: 16px;
`;

const styles = {
  list: {
    padding: 0,
    marginBottom: '10px',
    marginTop: 0,
    textAlign: 'left',
  },
  contactLink: {
    display: 'inline-block',
    padding: '5px 0',
    textDecoration: 'underline',
    color: WHITE,
  },
};

export const RequestProjectAccessComponent = React.memo(
  ({
    project,
    countries,
    onBackToProjects,
    onAttemptRequestProjectAccess,
    onRequestProjectAdditionalAccess,
    isRequestingAdditionalCountryAccess,
    isLoading,
    success,
    errorMessage,
  }) => {
    const requestedCountries = countries.filter(c => c.accessRequests.includes(project.code));
    const availableCountries = countries.filter(c => !c.accessRequests.includes(project.code));

    let hideForm = false;
    if (success || (requestedCountries.length > 0 && !isRequestingAdditionalCountryAccess))
      hideForm = true;

    const modalMessage = success ? (
      <SuccessMessage projectName={project.name} onBackToProjects={onBackToProjects} />
    ) : (
      <RequestPendingMessage
        requestedCountries={requestedCountries}
        availableCountries={availableCountries}
        setRequestingAdditionalCountryAccess={setRequestingAdditionalCountryAccess}
        handleRequest={onRequestProjectAdditionalAccess}
        onBackToProjects={onBackToProjects}
      />
    );

    return (
      <>
        <Header>
          <div>
            <Logo src={TUPAIA_LIGHT_LOGO_SRC} alt="Tupaia logo" />
            <TagLine>
              Data aggregation, analysis, and visualisation for the most remote settings in the
              world
            </TagLine>
          </div>
          <ExploreButton onClick={onBackToProjects} variant="outlined">
            <ExploreIcon />
            &nbsp; View other projects
          </ExploreButton>
        </Header>
        <Title>Requesting Project Access</Title>
        <HeroImage src={project.imageUrl}>
          {project.logoUrl && <LogoImage src={project.logoUrl} />}
        </HeroImage>
        <ProjectBody>
          <Heading>{project.name}</Heading>
          <SubHeading>{project.description}</SubHeading>
          {project.names && <Countries>{project.names.join(', ')}</Countries>}
          <Divider />
          {hideForm ? (
            modalMessage
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
                  {availableCountries.map(country => (
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
    );
  },
);

export const SuccessMessage = ({ projectName, onBackToProjects }) => (
  <>
    <Alert severity="success">
      Thank you for your access request to {projectName}. We will review your application and
      respond by email shortly.
    </Alert>
    <Note>
      Note: This can take some time to process, as requests require formal permission to be granted.
    </Note>
    <BackButton onClick={onBackToProjects}>Back to Projects</BackButton>
  </>
);

export const RequestPendingMessage = ({
  requestedCountries,
  availableCountries,
  handleRequest,
  onBackToProjects,
}) => (
  <>
    <p>
      <b>You have already requested access to this project</b>
    </p>
    <RequestedProjectCountryAccessList
      requestedCountries={requestedCountries}
      availableCountries={availableCountries}
      handleRequest={handleRequest}
    />
    <p>This can take some time to process, as requests require formal permission to be granted.</p>
    <p>
      {`If you have any questions, please email: `}
      <a style={styles.contactLink} href="mailto:admin@tupaia.org">
        admin@tupaia.org
      </a>
    </p>
    <BackButton onClick={onBackToProjects}>Back to Projects</BackButton>
  </>
);

export const RequestedProjectCountryAccessList = ({
  requestedCountries,
  availableCountries,
  handleRequest,
}) => {
  if (!availableCountries.length || !requestedCountries) return null;

  return (
    <>
      <SubHeading>Countries requested for this project:</SubHeading>
      <RequestedProjectCountriesList>
        <ul style={styles.list}>
          {requestedCountries.map(country => (
            <li key={`requestedProjectCountry${country.name}`}>{country.name}</li>
          ))}
        </ul>
      </RequestedProjectCountriesList>
      <RequestLink onClick={handleRequest}>Request other countries</RequestLink>
    </>
  );
};

SuccessMessage.propTypes = {
  projectName: PropTypes.string.isRequired,
  onBackToProjects: PropTypes.func.isRequired,
};

RequestedProjectCountryAccessList.propTypes = {
  requestedCountries: PropTypes.arrayOf(PropTypes.object).isRequired,
  availableCountries: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleRequest: PropTypes.func.isRequired,
};

RequestPendingMessage.propTypes = {
  requestedCountries: PropTypes.arrayOf(PropTypes.object).isRequired,
  availableCountries: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleRequest: PropTypes.func.isRequired,
  onBackToProjects: PropTypes.func.isRequired,
};

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
  onRequestProjectAdditionalAccess: PropTypes.func.isRequired,
  isRequestingAdditionalCountryAccess: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  success: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
  const { requestingAccess } = state.project;
  const {
    countries,
    isFetchingCountryAccessData,
    isRequestingCountryAccess,
    isRequestingAdditionalCountryAccess,
    hasRequestCountryAccessCompleted,
    errorMessage,
  } = state.requestCountryAccess;

  return {
    project: requestingAccess,
    countries: countries.filter(c => requestingAccess.names.includes(c.name)),
    isRequestingCountryAccess,
    isRequestingAdditionalCountryAccess,
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
    onRequestProjectAdditionalAccess: () => dispatch(setRequestingAdditionalCountryAccess(true)),
  };
};

export const RequestProjectAccessDialog = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RequestProjectAccessComponent);
