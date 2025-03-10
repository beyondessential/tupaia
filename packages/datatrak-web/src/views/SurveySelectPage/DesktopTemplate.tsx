import React from 'react';
import { DialogActions, Paper, Typography } from '@material-ui/core';
import { GroupedSurveyList } from '../../features';
import { Button } from '../../components';
import styled from 'styled-components';
import { SpinningLoader } from '@tupaia/ui-components';

const Container = styled(Paper).attrs({
  variant: 'outlined',
})`
  width: 48rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &.MuiPaper-root {
    max-height: 100%;
    height: 35rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 20rem;
  flex: 1;
`;

const Loader = () => (
  <LoadingContainer>
    <SpinningLoader />
  </LoadingContainer>
);

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  margin-bottom: 1rem;
`;

const Subheader = styled(Typography).attrs({
  variant: 'h2',
})`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.875rem;
  line-height: 1.125;
  font-weight: 400;
  margin-top: 0.67rem;
`;

export const DesktopTemplate = ({
  selectedCountry,
  selectedSurvey,
  setSelectedSurvey,
  showLoader,
  SubmitButton,
  CountrySelector,
}) => {
  return (
    <Container>
      <HeaderWrapper>
        <div>
          <Typography variant="h1">Select survey</Typography>
          <Subheader>Select a survey from the list below</Subheader>
        </div>
        {CountrySelector}
      </HeaderWrapper>
      {showLoader ? (
        <Loader />
      ) : (
        <GroupedSurveyList
          setSelectedSurvey={setSelectedSurvey}
          selectedSurvey={selectedSurvey}
          selectedCountry={selectedCountry}
        />
      )}
      <DialogActions>
        <Button to="/" variant="outlined">
          Cancel
        </Button>
        {SubmitButton}
      </DialogActions>
    </Container>
  );
};
