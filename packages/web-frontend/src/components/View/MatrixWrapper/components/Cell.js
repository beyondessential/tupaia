import React from 'react';
import { getPresentationOption } from '../../../../utils';

const ROW_INFO_KEY = '$rowInfo';

// Nested row values will be used in `DescriptionOverlay.js`
const getNestedRowsValue = ({ childRows, category, cellKey }) => {
  const rowsByCategoryId = childRows.filter(row => row.categoryId === category);
  return rowsByCategoryId.map(data => `${data.description}: ${data[cellKey] || null}`).join('\\n');
};

const getPresentationVariables = ({
  presentationOptions,
  value,
  extraConfig,
  childRows,
  category,
  cellKey,
}) => {
  if (extraConfig) {
    const { description, rowInfo } = extraConfig;
    let presentation = getPresentationOption(presentationOptions, value);
    // if presentation is null, we should not show the DescriptionOverlay popup.
    // So, only add the `main title` to the presentation object if presentation != null
    if (presentation) {
      presentation = {
        ...presentation,
        mainTitle: description,
      };
    }
    const color = presentation ? presentation.color : '';
    const onCellClickVariables = [
      presentation && presentation.description === ROW_INFO_KEY
        ? { ...presentation, description: rowInfo }
        : presentation,
      value,
    ];
    return { color, onCellClickVariables };
  }

  // For Cells in RowGroup
  const presentation = getPresentationOption(presentationOptions, value);
  const color = presentation ? presentation.color : { color: '' };
  const updatedValue = presentationOptions.showNestedRows
    ? getNestedRowsValue({ childRows, category, cellKey })
    : value;
  const onCellClickVariables = [presentation, updatedValue];
  return { color, onCellClickVariables };
};

const Cell = ({
  onMouseEnter,
  onMouseLeave,
  onCellClick,
  style,
  columnActiveStripStyle,
  dotStyle,
  dotStyleActive,
  presentationOptions,
  isActive,
  cellKey,
  value = '',
  isUsingDots,
  childRows,
  category,
  extraConfig, // extra config if cell is in Row, which also indicates different logic to get 'presentation'
}) => {
  const { color, onCellClickVariables } = getPresentationVariables({
    presentationOptions,
    value,
    extraConfig,
    childRows,
    category,
    cellKey,
  });
  const linesOfText = value.toString().split('\n');
  const contents = isUsingDots ? (
    <span
      style={{
        ...(isActive ? dotStyleActive : dotStyle),
        backgroundColor: color || 'transparent',
      }}
    />
  ) : (
    linesOfText.map((text, i) => (
      <span key={i}>
        {text}
        <br />
      </span>
    ))
  );
  const activeIndicator = isActive ? <span style={columnActiveStripStyle} /> : null;

  return (
    <div
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => onCellClick(...onCellClickVariables)}
      key={cellKey}
    >
      {activeIndicator}
      {contents}
    </div>
  );
};

export default React.memo(Cell, (currentProps, nextProps) => {
  if (currentProps.isActive !== nextProps.isActive) {
    return false;
  }
  return true;
});
