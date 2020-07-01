import React from 'react';

export const Cell = ({
  onMouseEnter,
  onMouseLeave,
  onClick,
  style,
  columnActiveStripStyle,
  dotStyle,
  dotStyleActive,
  color,
  isActive,
  cellKey,
  value = '',
  isUsingDots,
}) => {
  const linesOfText = value.toString().split('\n');
  const contents = isUsingDots && color && value !== '' ? ( //If it has color and value is not empty, we can treat it as a dot. Otherwise it can be text (which also works for empty value)
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
      onClick={onClick}
      key={cellKey}
    >
      {activeIndicator}
      {contents}
    </div>
  );
};
