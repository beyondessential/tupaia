import React from 'react';
import { getPresentationOption } from '../../../../utils';

const ROW_INFO_KEY = '$rowInfo';

const getPresentationVariables = (presentationOptions, value, extraConfig) => {
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
  const onCellClickVariables = [presentation, value];
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
  extraConfig, // only exists if in Row, which also indicates different logic to get 'presentation'
}) => {
  const { color, onCellClickVariables } = getPresentationVariables(
    presentationOptions,
    value,
    extraConfig,
  );
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
