/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useEffect, useRef, useState } from 'react';
import xlsx from 'xlsx';
import { useApiContext } from '../../../utilities/ApiProvider';

const useInitialFile = (surveyId, isOpen, uploadedFile = null) => {
  const [file, setFile] = useState(uploadedFile);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(null);
  const api = useApiContext();
  const getInitialFile = async () => {
    try {
      setIsLoading(true);
      const blob = await api.download(`export/surveys/${surveyId}`, {}, null, true);
      const arrayBuffer = await blob.arrayBuffer();

      setFile(arrayBuffer);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (uploadedFile) {
      setFile(uploadedFile);
    } else getInitialFile();
  }, [isOpen]);

  return { file, error, isLoading };
};

export const useSpreadsheetJSON = (surveyId, isOpen, uploadedFile = null) => {
  const { file, isLoading, error } = useInitialFile(surveyId, isOpen, uploadedFile);
  const [json, setJson] = useState(null);
  const initialData = useRef(null);
  const [dataHasBeenChanged, setDataHasBeenChanged] = useState(false);

  useEffect(() => {
    if (!file || json) return;
    const wb = xlsx.read(file, { type: 'array' });
    const sheetJson = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    setJson([...sheetJson]);
  }, [file]);

  useEffect(() => {
    if (!json || initialData?.current) return;
    // force a deep copy of the json object
    initialData.current = JSON.parse(JSON.stringify(json));
  }, [JSON.stringify(json)]);

  useEffect(() => {
    if (!json || !initialData?.current) return;
    const dataMatches = json.every((row, i) =>
      Object.entries(row).every(([key, value]) => {
        return value === initialData.current?.[i][key];
      }),
    );
    setDataHasBeenChanged(!dataMatches);
  }, [JSON.stringify(json)]);

  useEffect(() => {
    // when the modal is closed, reset the json and initialData, so that the next time the modal is opened, it will fetch the file again, and dataHasBeenChanged will be false
    if (!isOpen) {
      setJson(null);
      initialData.current = null;
    }
  }, [isOpen]);

  return { json, setJson, isLoading, error, dataHasBeenChanged };
};
