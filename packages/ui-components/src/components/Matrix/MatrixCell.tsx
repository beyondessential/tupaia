/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import styled from 'styled-components';
import { PresentationOptionCondition, PresentationOptionRange } from '@tupaia/types';
import Markdown from 'markdown-to-jsx';
import { MatrixColumnType, MatrixRowType } from '../../types';
import {
  checkIfApplyPillCellStyle,
  getFlattenedColumns,
  getIsUsingPillCell,
  getPresentationOption,
} from './utils';
import { MatrixContext } from './MatrixContext';
import { Cell } from './Cell';
import { Pill } from './Pill';
import { MATRIX_ROW_CLASS_PARENT } from './MatrixRow';

const NO_DATA_CELL_CLASS = 'no-data';

const DataCell = styled(Cell)`
  vertical-align: middle;
  position: relative;
  z-index: 1;
  height: 100%;
`;

const DataCellContent = styled.div<{
  $characterLength?: number;
}>`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  min-width: ${({ $characterLength = 0 }) =>
    $characterLength > 30
      ? '25ch'
      : '13ch'}; // Apply the min width to the content because the cell has padding and we want the content to have a min width and then the padding on top of that

  // If cell is in an expandable row, show nothing in its empty state (instead of the default em
  // dash). This ‘parent’ class comes from {@link MatrixRow}.
  .${MATRIX_ROW_CLASS_PARENT} &.${NO_DATA_CELL_CLASS} {
    visibility: collapse;
  }
`;

const TooltipSubheading = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

interface MatrixCellProps {
  value: any;
  rowTitle: MatrixRowType['title'];
  isCategory?: boolean;
  colKey: MatrixColumnType['key'];
}

interface PillCellProps
  extends Pick<MatrixCellProps, 'rowTitle' | 'value' | 'isCategory' | 'colKey'> {
  presentation?: PresentationOptionCondition | PresentationOptionRange | null | undefined;
}
const PillCell = ({ rowTitle, value, presentation, isCategory, colKey }: PillCellProps) => {
  const { presentationOptions, categoryPresentationOptions, rows } = useContext(MatrixContext);

  // If it is a category header cell, use the category presentation options, otherwise use the normal presentation options
  const getPresentationOptionsToUse = () => {
    if (isCategory) {
      return categoryPresentationOptions;
    }
    return presentationOptions;
  };
  const presentationOptionsToUse = getPresentationOptionsToUse();

  const getNestedRowData = () => {
    const fullRow = rows.find(({ title }) => title === rowTitle);
    if (!fullRow || !fullRow.children) return '';
    return fullRow.children
      .map(childRow => {
        const { title: childRowTitle } = childRow;
        const childRowValue = childRow[colKey];
        return `${childRowTitle}: ${childRowValue ?? null}`;
      })
      .join('\\n');
  };

  const getBodyText = () => {
    if (isCategory && presentationOptionsToUse?.showNestedRows) {
      return getNestedRowData();
    }
    const displayValue = presentationOptionsToUse?.showRawValue ? value : '';
    if (!presentation?.description) return displayValue;
    return `${presentation?.description}${
      presentationOptionsToUse?.showRawValue ? ` ${value}` : ''
    }`;
  };

  // Render the description, and also value if showRawValue is true. Also handle newlines in markdown
  const bodyText = getBodyText();

  const isNullish = value === undefined || value === null;

  const showTooltip = !isNullish && !!bodyText && bodyText !== value;

  return (
    <DataCell $characterLength={0}>
      <DataCellContent>
        <Pill
          color={presentation?.color}
          tooltip={
            showTooltip ? (
              <>
                {presentation?.label && (
                  <TooltipSubheading>{presentation?.label}</TooltipSubheading>
                )}
                <Markdown>{bodyText.replace(/\\n/g, '\n\n')}</Markdown>
              </>
            ) : null
          }
        >
          {value ?? '—' /* em dash */}
        </Pill>
      </DataCellContent>
    </DataCell>
  );
};

/**
 * This renders a cell in the matrix table. It can either be a category header cell or a data cell. If it has presentation options, it will be a button that can be clicked to expand the data. Otherwise, it will just display the data as normal
 */
export const MatrixCell = ({ value, rowTitle, isCategory, colKey }: MatrixCellProps) => {
  const { presentationOptions, categoryPresentationOptions, columns } = useContext(MatrixContext);
  // If the cell is a category, it means it is a category header cell and should use the category presentation options. Otherwise, it should use the normal presentation options

  const allColumns = getFlattenedColumns(columns);
  const colIndex = allColumns.findIndex(({ key }) => key === colKey);

  const presentationOptionsForCell = isCategory ? categoryPresentationOptions : presentationOptions;

  const isPillCell =
    getIsUsingPillCell(presentationOptionsForCell) &&
    checkIfApplyPillCellStyle(presentationOptionsForCell, colIndex);

  const presentation = getPresentationOption(presentationOptionsForCell, value);

  if (isPillCell)
    return (
      <PillCell
        rowTitle={rowTitle}
        value={value}
        presentation={presentation}
        isCategory={isCategory}
        colKey={colKey}
      />
    );

  const displayValue = value ?? '—'; // em dash
  const classes = !!value ? undefined : NO_DATA_CELL_CLASS;
  const characterLength = isPillCell ? 0 : String(displayValue).length;
  return (
    <DataCell $characterLength={characterLength}>
      <DataCellContent className={classes} $characterLength={characterLength}>
        {displayValue}
      </DataCellContent>
    </DataCell>
  );
};
