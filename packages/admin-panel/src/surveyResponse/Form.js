/*
 * Tupaia
 * Copyright (c) 2023 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable camelcase */

import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, DialogFooter } from '@tupaia/ui-components';
import { Divider } from '@material-ui/core';
import { useGetExistingData } from './useGetExistingData';
import { ModalContentProvider } from '../widgets';
import { useResubmitSurveyResponse } from '../api/mutations/useResubmitSurveyResponse';
import { MODAL_STATUS } from './constants';
import { SurveyScreens } from './SurveyScreens';
import { ResponseFields } from './ResponseFields';

export const Form = ({ surveyResponseId, onDismiss }) => {
  const [surveyResubmission, setSurveyResubmission] = useState({});
  const isUnchanged = Object.keys(surveyResubmission).length === 0;
  const [resubmitStatus, setResubmitStatus] = useState(MODAL_STATUS.INITIAL);
  const [updatedFields, setUpdatedFields] = useState({});
  const [currentScreenNumber, setCurrentScreenNumber] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState({});

  const useResubmitResponse = () => {
    return useResubmitSurveyResponse(surveyResponseId, surveyResubmission);
  };
  const { mutateAsync: resubmitResponse, error: resubmitError } = useResubmitResponse();

  const handleResubmit = useCallback(async () => {
    setResubmitStatus(MODAL_STATUS.LOADING);
    try {
      await resubmitResponse();
    } catch (e) {
      setResubmitStatus(MODAL_STATUS.ERROR);
      return;
    }
    setResubmitStatus(MODAL_STATUS.SUCCESS);
  });

  const { data, isLoading: isFetching, errorMessage: fetchErrorMessage } = useGetExistingData(
    surveyResponseId,
  );

  useEffect(() => {
    if (!data) {
      setSelectedEntity({});
    } else {
      setSelectedEntity(data?.primaryEntity);
    }
  }, [data]);

  const existingAndNewFields = { ...data?.surveyResponse, ...updatedFields };
  const isResubmitting = resubmitStatus === MODAL_STATUS.LOADING;

  return (
    <ModalContentProvider
      isLoading={isFetching || isResubmitting}
      errorMessage={fetchErrorMessage || resubmitError}
    >
      {!isFetching && (
        <ResponseFields
          onChange={(fieldName, updatedValue) =>
            setSurveyResubmission({ ...surveyResubmission, [fieldName]: updatedValue })
          }
          selectedEntity={selectedEntity}
          surveyName={data?.survey.name}
          existingAndNewFields={existingAndNewFields}
          currentScreenNumber={currentScreenNumber}
        />
      )}
      <Divider />
      {!isFetching && (
        <SurveyScreens
          onChange={updatedAnswers =>
            setSurveyResubmission({ ...surveyResubmission, answers: updatedAnswers })
          }
          survey={data?.survey}
          existingAnswers={data?.answers}
          selectedEntity={selectedEntity}
          setSelectedEntity={setSelectedEntity}
          surveyResponse={data?.surveyResponse}
          existingAndNewFields={existingAndNewFields}
          setUpdatedFields={setUpdatedFields}
          currentScreenNumber={currentScreenNumber}
          setCurrentScreenNumber={setCurrentScreenNumber}
        />
      )}
      <DialogFooter>
        <Button variant="outlined" onClick={onDismiss} disabled={false}>
          Cancel
        </Button>
        <Button
          id="form-button-resubmit"
          onClick={() => handleResubmit()}
          disabled={isFetching || isUnchanged}
        >
          Resubmit
        </Button>
      </DialogFooter>
    </ModalContentProvider>
  );
};

Form.propTypes = {
  surveyResponseId: PropTypes.string,
  onDismiss: PropTypes.func.isRequired,
};

Form.defaultProps = {
  surveyResponseId: undefined,
};
