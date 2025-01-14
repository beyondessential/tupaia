import React, { useContext } from 'react';
import styled, { css } from 'styled-components';
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

const MATRIX_CELL_CLASS_NO_DATA = 'no-data';

const DataCell = styled(Cell)`
  vertical-align: middle;
  position: relative;
  z-index: 1;
  height: 100%;
`;

const DataCellContent = styled.div<{
  $characterLength?: number;
  $isCategory?: boolean;
}>`
  align-items: center;
  display: flex;
  height: 100%;
  width: 100%;

  // Apply the min width to the content because the cell has padding and we want the content to have
  // a min width and then the padding on top of that
  min-width: ${({ $characterLength = 0 }) => ($characterLength > 30 ? '25ch' : '13ch')};

  // If an empty cell is in an expandable row, show nothing instead of the default dash. (If it has
  // data, show it as normal.)
  ${({ $isCategory }) => {
    if ($isCategory)
      return css`
        &.${MATRIX_CELL_CLASS_NO_DATA} {
          visibility: collapse;
        }
      `;
  }}
`;

const TooltipSubheading = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.5rem;
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

  // If it is a category header cell, use the category presentation options, otherwise use the
  // normal presentation options
  const presentationOptionsToUse = isCategory ? categoryPresentationOptions : presentationOptions;

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

  /**
   * Render the description, and also value if showRawValue is true. Also handle newlines in
   * markdown
   */
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
 * This renders a cell in the matrix table. It can either be a category header cell or a data cell.
 * If it has presentation options, it will be a button that can be clicked to expand the data.
 * Otherwise, it will just display the data as normal
 */
export const MatrixCell = ({ value, rowTitle, isCategory, colKey }: MatrixCellProps) => {
  const { presentationOptions, categoryPresentationOptions, columns } = useContext(MatrixContext);

  const allColumns = getFlattenedColumns(columns);
  const colIndex = allColumns.findIndex(({ key }) => key === colKey);

  // If the cell is a category, it means it is a category header cell and should use the category
  // presentation options. Otherwise, it should use the normal presentation options
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
  const classes = !!value ? undefined : MATRIX_CELL_CLASS_NO_DATA;
  const characterLength = isPillCell ? 0 : String(displayValue).length;
  return (
    <DataCell $characterLength={characterLength}>
      <DataCellContent
        className={classes}
        $characterLength={characterLength}
        $isCategory={isCategory}
      >
        {displayValue}
      </DataCellContent>
    </DataCell>
  );
};
