import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, ModalContentProvider, ModalFooter } from '@tupaia/ui-components';
import { useGetExistingData } from './useGetExistingData';
import { useEditSurveyResponse } from '../api/mutations/useEditSurveyResponse';
import { ResponseFields } from './ResponseFields';

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const Form = ({ surveyResponseId, onDismiss, onAfterMutate }) => {
  const [editedData, setEditedData] = useState({});
  const isUnchanged = Object.keys(editedData).length === 0;

  const [selectedEntity, setSelectedEntity] = useState({});

  const {
    mutateAsync: editResponse,
    isLoading,
    isError,
    error: editError,
    reset, // reset the mutation state so we can dismiss the error
    isSuccess,
  } = useEditSurveyResponse(surveyResponseId, editedData);

  const { data, isLoading: isFetching, error: fetchError } = useGetExistingData(surveyResponseId);

  const existingAndNewFields = { ...data?.surveyResponse, ...editedData };

  useEffect(() => {
    if (!data) {
      setSelectedEntity({});
    } else {
      setSelectedEntity(data?.primaryEntity);
    }
  }, [data]);

  const resubmitSurveyResponse = async () => {
    await editResponse();
    onAfterMutate();
  };

  const getDatatrakBaseUrl = () => {
    if (import.meta.env.REACT_APP_DATATRAK_WEB_URL)
      return import.meta.env.REACT_APP_DATATRAK_WEB_URL;
    const { origin } = window.location;
    if (origin.includes('localhost')) return 'https://dev-datatrak.tupaia.org';
    return origin.replace('admin', 'datatrak');
  };

  const resubmitResponseAndRedirect = async () => {
    // If the response has been changed, resubmit it before redirecting
    if (!isUnchanged) {
      await editResponse();
      onAfterMutate();
    }
    const { country_code: updatedCountryCode } = selectedEntity;
    const { survey, primaryEntity } = data;
    const countryCodeToUse = updatedCountryCode || primaryEntity.country_code;
    const datatrakBaseUrl = getDatatrakBaseUrl();
    const url = `${datatrakBaseUrl}/survey/${countryCodeToUse}/${survey.code}/resubmit/${surveyResponseId}`;
    // Open the URL in a new tab, so the user can resubmit the response in Datatrak
    window.open(url, '_blank');
  };

  const renderButtons = useCallback(() => {
    if (isLoading) return null;
    if (isError)
      return (
        <Button variant="outlined" onClick={reset}>
          Dismiss
        </Button>
      );
    if (isSuccess) return <Button onClick={onDismiss}>Close</Button>;
    return (
      <ButtonGroup>
        <Button
          id="form-button-resubmit"
          onClick={resubmitSurveyResponse}
          variant="outlined"
          disabled={isFetching || isUnchanged}
          color="primary"
        >
          Save and close
        </Button>
        <div>
          <Button variant="outlined" onClick={onDismiss}>
            Cancel
          </Button>
          <Button id="form-button-next" onClick={resubmitResponseAndRedirect} disabled={isFetching}>
            Next
          </Button>
        </div>
      </ButtonGroup>
    );
  }, [isFetching, isUnchanged, isLoading, isError, isSuccess]);

  return (
    <>
      <ModalContentProvider isLoading={isFetching || isLoading} error={fetchError || editError}>
        {!isFetching && !isSuccess && (
          <ResponseFields
            selectedEntity={selectedEntity}
            surveyName={data?.survey.name}
            fields={existingAndNewFields}
            onChange={(field, updatedField) =>
              setEditedData({ ...editedData, [field]: updatedField })
            }
            setSelectedEntity={setSelectedEntity}
          />
        )}
        {isSuccess && 'The survey response has been successfully submitted.'}
      </ModalContentProvider>
      <ModalFooter>{renderButtons()}</ModalFooter>
    </>
  );
};

Form.propTypes = {
  surveyResponseId: PropTypes.string,
  onDismiss: PropTypes.func.isRequired,
  onAfterMutate: PropTypes.func.isRequired,
};

Form.defaultProps = {
  surveyResponseId: undefined,
};
