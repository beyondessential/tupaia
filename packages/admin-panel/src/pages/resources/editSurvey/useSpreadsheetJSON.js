/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useEffect, useState } from 'react';
import xlsx from 'xlsx';
import { useApiContext } from '../../../utilities/ApiProvider';

const useInitialFile = (surveyId, isOpen, uploadedFile = null) => {
  const [file, setFile] = useState(uploadedFile);

  const [error, setError] = useState(null);
  const api = useApiContext();
  const getInitialFile = async () => {
    try {
      const blob = await api.download(`export/surveys/${surveyId}`, {}, null, true);
      const arrayBuffer = await blob.arrayBuffer();

      setFile(arrayBuffer);
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => {
    if (file || !isOpen) return;
    if (uploadedFile) {
      setFile(uploadedFile);
    } else getInitialFile();
  }, [isOpen]);

  return { file, error };
};

export const useSpreadsheetJSON = (surveyId, isOpen, uploadedFile = null) => {
  const { file } = useInitialFile(surveyId, isOpen, uploadedFile);
  const [json, setJson] = useState(null);

  useEffect(() => {
    if (!file || json) return;
    const wb = xlsx.read(file, { type: 'array' });
    const sheetJson = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    setJson(sheetJson);
  }, [file]);

  return { json, setJson };
};
