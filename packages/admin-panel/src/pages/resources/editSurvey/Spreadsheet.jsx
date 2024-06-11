/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import xlsx from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { useTable } from 'react-table';
import { useApiContext } from '../../../utilities/ApiProvider';

const Cell = styled(TableCell)`
  padding-inline: 0.2rem;
  padding-block: 0.4rem;
  border-color: ${({ theme }) => theme.palette.grey['400']};
  border-style: solid;
  border-width: 0 1px 1px 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  // TODO: fix this once we apply resizable columns
  max-width: 200px;
`;

const HeaderCell = styled(Cell).attrs({
  component: 'th',
})`
  position: sticky;
  background-color: ${({ theme }) => theme.palette.grey['400']};
  border-color: white;
  border-style: solid;
  thead & {
    top: 0;
    border-width: 0 1px 1px 0;
    &:first-child {
      z-index: 3;
    }
  }
  body & {
    left: 0;
  }
`;

const StyledTable = styled(Table)``;

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
  const { file } = useInitialFile(survey?.id, open, currentFile);
  const json = useSpreadsheetJson(file);

  const columns = useMemo(
    () => (json ? Object.keys(json[0]).map(key => ({ Header: key, accessor: key })) : []),
    [json],
  );

  const data = useMemo(() => {
    if (!json) return [];
    return json;
  }, [json]);

  const { headers, rows, prepareRow } = useTable({
    columns,
    data,
  });
  return (
    <TableContainer>
      <StyledTable stickyHeader size="small">
        <TableHead>
          <TableRow>
            <HeaderCell />
            {headers.map(header => (
              <HeaderCell key={header.id} {...header.getHeaderProps()}>
                {header.render('Header')}
              </HeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <TableRow key={row.id} {...row.getRowProps()}>
                <HeaderCell>{i + 1}</HeaderCell>
                {row.cells.map(cell => (
                  <Cell key={cell.id} {...cell.getCellProps()}>
                    {cell.render('Cell')}
                  </Cell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </StyledTable>
    </TableContainer>
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
