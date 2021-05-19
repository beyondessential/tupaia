/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PrevIcon from 'material-ui/svg-icons/navigation/chevron-left';
import NextIcon from 'material-ui/svg-icons/navigation/chevron-right';
import shallowEqual from 'shallowequal';

import Cell from './Cell';
import { PRESENTATION_OPTIONS_SHAPE } from '../../propTypes';
import { checkIfApplyDotStyle } from '../../utils';

export default class Row extends Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    // Always update this component on prop change if currently highlighted or
    // about to be highlighted regardless of whether highlight state is changing.
    if (currentProps.isRowHighlighted || nextProps.isRowHighlighted) {
      return true;
    }

    return !shallowEqual(nextProps, currentProps, (a, b, key) => {
      if (key) {
        // Skip properties which shouldn't trigger re-renders.
        if (key === 'highlightedColumn') {
          return true;
        }

        return a === b;
      }
      return false;
    });
  }

  getRowElement() {
    return this.rowElement;
  }

  render() {
    const {
      rowKey,
      isRowHighlighted,
      highlightedColumn,
      columns,
      startColumn,
      numberOfColumnsPerPage,
      depth,
      categoryIndent,
      description,
      onCellMouseEnter,
      onCellMouseLeave,
      onCellClick,
      onTitleClick,
      onMoveColumnPress,
      onMoveColumnRelease,
      presentationOptions,
      isPreviousColumnEnabled,
      isNextColumnEnabled,
      styles,
      isUsingDots,
      rowInfo,
    } = this.props;

    return (
      <div
        style={isRowHighlighted ? { ...styles.row, ...styles.rowHighlighted } : styles.row}
        onMouseEnter={() => onCellMouseEnter(null, rowKey)}
        onMouseLeave={() => onCellMouseLeave()}
        ref={element => {
          this.rowElement = element;
        }}
      >
        <div
          style={{
            ...styles.gridCell,
            ...styles.descriptionCell,
            paddingLeft: depth * categoryIndent,
          }}
          onClick={onTitleClick}
        >
          {description}
        </div>
        <div style={isRowHighlighted ? styles.gridCellChanger : styles.gridCellChangerActive}>
          {isRowHighlighted ? (
            <div
              style={isPreviousColumnEnabled ? styles.columnChanger : styles.columnChangerDisabled}
              onMouseDown={() => onMoveColumnPress(-1)}
              onMouseUp={onMoveColumnRelease}
            >
              <PrevIcon />
            </div>
          ) : null}
        </div>
        {columns.map((column, index) => {
          if (index < startColumn || index >= startColumn + numberOfColumnsPerPage) {
            return null;
          }

          const isCellActive = index === highlightedColumn && isRowHighlighted;
          const { value: cellValue = '', isGroupBoundary } = column;

          if (isGroupBoundary) {
            const style = isRowHighlighted ? styles.gridCellChanger : styles.gridCellChangerActive;
            return <div style={style} key={index} />;
          }

          const applyDotStyle = checkIfApplyDotStyle(presentationOptions)
            ? presentationOptions.applyLocation.columnIndexes.includes(index)
            : true;

          return (
            <Cell
              key={index}
              cellKey={index}
              onMouseEnter={() => onCellMouseEnter(index, rowKey)}
              onMouseLeave={() => onCellMouseLeave()}
              presentationOptions={presentationOptions}
              onClick={onCellClick}
              value={cellValue}
              style={styles.gridCell}
              columnActiveStripStyle={styles.columnActiveStrip}
              isActive={isCellActive}
              dotStyle={styles.cellIndicator}
              dotStyleActive={styles.cellIndicatorActive}
              isUsingDots={isUsingDots && applyDotStyle}
              presentationConfigIfInRow={{ description, rowInfo }}
            />
          );
        })}
        <div
          style={isRowHighlighted ? styles.gridCellChanger : styles.gridCellChangerActive}
          onMouseEnter={() => onCellMouseEnter(null, rowKey)}
          onMouseLeave={() => onCellMouseLeave()}
        >
          {isRowHighlighted ? (
            <div
              style={isNextColumnEnabled ? styles.columnChanger : styles.columnChangerDisabled}
              onMouseDown={() => onMoveColumnPress(1)}
              onMouseUp={onMoveColumnRelease}
            >
              <NextIcon />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

Row.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object),
  isRowHighlighted: PropTypes.bool,
  highlightedColumn: PropTypes.number,
  depth: PropTypes.number,
  categoryIndent: PropTypes.number,
  onCellMouseEnter: PropTypes.func,
  onCellMouseLeave: PropTypes.func,
  onCellClick: PropTypes.func,
  onTitleClick: PropTypes.func,
  styles: PropTypes.object.isRequired,
  presentationOptions: PropTypes.shape(PRESENTATION_OPTIONS_SHAPE),
  isPreviousColumnEnabled: PropTypes.bool,
  isNextColumnEnabled: PropTypes.bool,
};
