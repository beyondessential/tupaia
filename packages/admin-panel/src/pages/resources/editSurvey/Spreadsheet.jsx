/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import xlsx from 'xlsx';
import { TableContainer as MuiTableContainer } from '@material-ui/core';
import BaseTable from 'react-base-table';
import 'react-base-table/styles.css';
import { useApiContext } from '../../../utilities/ApiProvider';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const TableContainer = styled(MuiTableContainer)`
  flex: 1;
  overflow: hidden;
  .BaseTable__header-cell {
    background-color: ${props => props.theme.palette.grey['400']};
    border-right: 1px solid white;
  }
  .BaseTable__row-cell {
    border-right: 1px solid ${props => props.theme.palette.grey['400']};
  }
  .BaseTable__row {
    border-color: ${props => props.theme.palette.grey['400']};
  }
  .BaseTable__table-frozen-left {
    .BaseTable__row-cell {
      background-color: ${props => props.theme.palette.grey['400']};
    }
    .BaseTable__row {
      border-color: white;
    }
  }
`;

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

const useSpreadsheetJson = file => {
  const [json, setJson] = useState(null);

  useEffect(() => {
    if (!file || json) return;
    const wb = xlsx.read(file, { type: 'array' });
    const sheetJson = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    setJson(sheetJson);
  }, [file]);

  return json;
};

export const Spreadsheet = ({ survey, open, currentFile }) => {
  const tableContainerRef = useRef();

  const { file } = useInitialFile(survey?.id, open, currentFile);
  const json = useSpreadsheetJson(file);

  const columns = useMemo(() => {
    if (!json) return [];
    return [
      {
        key: 'id',
        id: 'id',
        dataKey: 'id',
        title: '',
        width: 50,
        frozen: true,
      },
      ...Object.keys(json[0]).map(key => ({
        key,
        id: key,
        dataKey: key,
        title: key,
        width: 100,
        resizable: true,
      })),
    ];
  }, [JSON.stringify(json)]);

  const data = useMemo(() => {
    if (!json) return [];
    return json.map((row, index) => ({ ...row, id: index + 1 }));
  }, [JSON.stringify(json)]);

  return (
    <Wrapper>
      <TableContainer ref={tableContainerRef}>
        <BaseTable
          data={data}
          columns={columns}
          maxHeight={tableContainerRef.current?.clientHeight ?? 0}
          fixed
          width={tableContainerRef.current?.clientWidth ?? 0}
          headerHeight={30}
          rowHeight={30}
        />
      </TableContainer>
    </Wrapper>
  );
};

Spreadsheet.propTypes = {
  open: PropTypes.bool.isRequired,
  survey: PropTypes.object.isRequired,
  currentFile: PropTypes.object,
};

Spreadsheet.defaultProps = {
  currentFile: null,
};
