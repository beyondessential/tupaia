import React from 'react';
import { getPresentationOption } from '../../../../utils';

const ROW_INFO_KEY = '$rowInfo';

// Nested row values will be used in `DescriptionOverlay.js`
const getNestedRowsValue = ({ childRows, category, cellKey }) => {
  const rowsInCategory = childRows.filter(row => row.categoryId === category);
  return rowsInCategory.map(data => `${data.description}: ${data[cellKey] ?? null}`).join('\\n');
};

const getPresentation = (presentationOptions, value, presentationConfigIfInRow) => {
  const presentation = getPresentationOption(presentationOptions, value);
  if (presentation && presentationConfigIfInRow) {
    const { description } = presentationConfigIfInRow;
    // if presentation is null, we should not show the DescriptionOverlay popup.
    // So, only add the `main title` to the presentation object if presentation != null
    return {
      ...presentation,
      mainTitle: description,
    };
  }
  return presentation;
};

const getColor = (presentation, presentationConfigIfInRow) => {
  if (presentationConfigIfInRow) {
    return presentation ? presentation.color : '';
  }
  return presentation ? presentation.color : { color: '' };
};

const getOnCellClickVariables = ({
  presentationOptions,
  presentation,
  presentationConfigIfInRow,
  value,
  childRows,
  category,
  cellKey,
}) => {
  if (presentationConfigIfInRow) {
    const { rowInfo } = presentationConfigIfInRow;
    const updatedPresentation =
      presentation && presentation.description === ROW_INFO_KEY
        ? { ...presentation, description: rowInfo }
        : presentation;
    return [updatedPresentation, value];
  }
  const updatedValue = presentationOptions.showNestedRows
    ? getNestedRowsValue({ childRows, category, cellKey })
    : value;
  return [presentation, updatedValue];
};

const Cell = ({
  onMouseEnter,
  onMouseLeave,
  onClick,
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
  presentationConfigIfInRow,
}) => {
  const presentation = getPresentation(presentationOptions, value, presentationConfigIfInRow);
  const color = getColor(presentation, presentationConfigIfInRow);
  const onCellClickVariables = getOnCellClickVariables({
    presentationOptions,
    presentation,
    presentationConfigIfInRow,
    value,
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
      onClick={() => onClick(...onCellClickVariables)}
      key={cellKey}
    >
      {activeIndicator}
      {contents}
    </div>
  );
};

const memoDependency = (currentProps, nextProps, dependencies) => {
  for (const dependency of dependencies) {
    if (currentProps[dependency] !== nextProps[dependency]) return false;
  }
  return true;
};

export default React.memo(Cell, (currentProps, nextProps) =>
  memoDependency(currentProps, nextProps, ['isActive', 'value', 'style']),
);
