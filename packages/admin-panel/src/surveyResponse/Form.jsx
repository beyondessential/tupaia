/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from '@tupaia/ui-components';
import { useGetExistingData } from './useGetExistingData';
import { ModalContentProvider, ModalFooter } from '../widgets';
import { useResubmitSurveyResponse } from '../api/mutations/useResubmitSurveyResponse';
import { ResponseFields } from './ResponseFields';

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const Form = ({ surveyResponseId, onDismiss, onAfterMutate }) => {
  const [surveyResubmission, setSurveyResubmission] = useState({});
  const isUnchanged = Object.keys(surveyResubmission).length === 0;

  const [selectedEntity, setSelectedEntity] = useState({});

  const {
    mutateAsync: resubmitResponse,
    isLoading,
    isError,
    error: resubmitError,
    reset, // reset the mutation state so we can dismiss the error
    isSuccess,
  } = useResubmitSurveyResponse(surveyResponseId, surveyResubmission);

  const { data, isLoading: isFetching, error: fetchError } = useGetExistingData(surveyResponseId);
  const fetchErrorMessage = fetchError?.message;

  const existingAndNewFields = { ...data?.surveyResponse, ...surveyResubmission };

  useEffect(() => {
    if (!data) {
      setSelectedEntity({});
    } else {
      setSelectedEntity(data?.primaryEntity);
    }
  }, [data]);

  const resubmitSurveyResponse = async () => {
    await resubmitResponse();
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
      await resubmitResponse();
    }
    const { survey, primaryEntity } = data;
    const datatrakBaseUrl = getDatatrakBaseUrl();
    const url = `${datatrakBaseUrl}/survey/${primaryEntity.country_code}/${survey.code}/resubmit/${surveyResponseId}`;

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
      <ModalContentProvider
        isLoading={isFetching || isLoading}
        errorMessage={fetchErrorMessage || resubmitError?.message}
      >
        {!isFetching && !isSuccess && (
          <ResponseFields
            selectedEntity={selectedEntity}
            surveyName={data?.survey.name}
            fields={existingAndNewFields}
            onChange={(field, updatedField) =>
              setSurveyResubmission({ ...surveyResubmission, [field]: updatedField })
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
