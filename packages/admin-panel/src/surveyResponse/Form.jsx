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
    reset,
    isSuccess,
  } = useResubmitSurveyResponse(surveyResponseId, surveyResubmission, onAfterMutate);

  const { data, isLoading: isFetching, error: fetchError } = useGetExistingData(surveyResponseId);
  const fetchErrorMessage = fetchError?.message;

  useEffect(() => {
    if (!data) {
      setSelectedEntity({});
    } else {
      setSelectedEntity(data?.primaryEntity);
    }
  }, [data]);

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
          type="submit"
          onClick={resubmitResponse}
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
          <Button
            id="form-button-resubmit"
            type="submit"
            onClick={resubmitResponse}
            disabled={isFetching || isUnchanged}
          >
            Resubmit
          </Button>
        </div>
      </ButtonGroup>
    );
  }, [isFetching, isUnchanged, isLoading, isError, isSuccess]);

  const existingAndNewFields = { ...data?.surveyResponse, ...surveyResubmission };

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
