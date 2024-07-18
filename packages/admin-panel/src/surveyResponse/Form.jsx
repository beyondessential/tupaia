/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, ModalContentProvider, ModalFooter } from '@tupaia/ui-components';
import { Divider } from '@material-ui/core';
import { useGetExistingData } from './useGetExistingData';
import { useResubmitSurveyResponse } from '../api/mutations/useResubmitSurveyResponse';
import { MODAL_STATUS } from './constants';
import { SurveyScreens } from './SurveyScreens';
import { ResponseFields } from './ResponseFields';

export const Form = ({ surveyResponseId, onDismiss, onAfterMutate }) => {
  const [surveyResubmission, setSurveyResubmission] = useState({});
  const [filesByQuestionCode, setFilesByQuestionCode] = useState({});
  const isUnchanged = Object.keys(surveyResubmission).length === 0;
  const [resubmitStatus, setResubmitStatus] = useState(MODAL_STATUS.INITIAL);

  const [selectedEntity, setSelectedEntity] = useState({});
  const [resubmitError, setResubmitError] = useState(null);

  const useResubmitResponse = () => {
    // Swap filesByQuestionCode to filesByUniqueFileName.
    // Tracking by question code allows us to manage files easier e.g. don't have to worry about tracking them in deletions
    // And the API endpoint needs them by uniqueFileName
    const filesByUniqueFileName = {};
    for (const [questionCode, file] of Object.entries(filesByQuestionCode)) {
      const uniqueFileName = surveyResubmission.answers[questionCode];
      filesByUniqueFileName[uniqueFileName] = file;
    }
    return useResubmitSurveyResponse(surveyResponseId, surveyResubmission, filesByUniqueFileName);
  };
  const { mutateAsync: resubmitResponse } = useResubmitResponse();

  const handleResubmit = useCallback(async () => {
    setResubmitStatus(MODAL_STATUS.LOADING);
    try {
      await resubmitResponse();
    } catch (e) {
      setResubmitStatus(MODAL_STATUS.ERROR);
      setResubmitError(e);
      return;
    }
    setResubmitStatus(MODAL_STATUS.SUCCESS);
    onAfterMutate();
  });

  const { data, isLoading: isFetching, error: fetchError } = useGetExistingData(surveyResponseId);

  useEffect(() => {
    if (!data) {
      setSelectedEntity({});
    } else {
      setSelectedEntity(data?.primaryEntity);
    }
  }, [data]);

  const handleDismissError = () => {
    setResubmitStatus(MODAL_STATUS.INITIAL);
    setResubmitError(null);
  };

  const onSetFormFile = (questionCode, file) => {
    setFilesByQuestionCode({ ...filesByQuestionCode, [questionCode]: file });
  };

  const renderButtons = useCallback(() => {
    switch (resubmitStatus) {
      case MODAL_STATUS.LOADING:
        return <></>;
      case MODAL_STATUS.ERROR:
        return (
          <>
            <Button variant="outlined" onClick={() => handleDismissError()}>
              Dismiss
            </Button>
          </>
        );
      case MODAL_STATUS.SUCCESS:
        return (
          <>
            <Button onClick={onDismiss}>Close</Button>
          </>
        );
      case MODAL_STATUS.INITIAL:
      default:
        return (
          <>
            <Button variant="outlined" onClick={onDismiss}>
              Cancel
            </Button>
            <Button
              id="form-button-resubmit"
              type="submit"
              onClick={() => handleResubmit()}
              disabled={isFetching || isUnchanged}
            >
              Resubmit
            </Button>
          </>
        );
    }
  }, [resubmitStatus, isFetching, isUnchanged]);

  const existingAndNewFields = { ...data?.surveyResponse, ...surveyResubmission };
  const isResubmitting = resubmitStatus === MODAL_STATUS.LOADING;
  const isResubmitSuccess = resubmitStatus === MODAL_STATUS.SUCCESS;

  return (
    <>
      <ModalContentProvider
        isLoading={isFetching || isResubmitting}
        error={fetchError || resubmitError}
      >
        {!isFetching && !isResubmitSuccess && (
          <>
            <ResponseFields
              selectedEntity={selectedEntity}
              surveyName={data?.survey.name}
              fields={existingAndNewFields}
              onChange={(field, updatedField) =>
                setSurveyResubmission({ ...surveyResubmission, [field]: updatedField })
              }
              setSelectedEntity={setSelectedEntity}
            />
            <Divider />
            <SurveyScreens
              onChange={(field, updatedField) =>
                setSurveyResubmission({ ...surveyResubmission, [field]: updatedField })
              }
              onSetFormFile={onSetFormFile}
              survey={data?.survey}
              existingAnswers={data?.answers}
              selectedEntity={selectedEntity}
              fields={existingAndNewFields}
            />
          </>
        )}
        {isResubmitSuccess && 'The survey response has been successfully submitted.'}
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
