/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { TRANS_BLACK, DARK_BLUE, DIALOG_Z_INDEX, WHITE } from '../../../../styles';
import {
  MINIMUM_CELL_WIDTH,
  CELL_WIDTH_PER_CHARACTER,
  LABEL_WIDTH,
  DESCRIPTION_CELL_WIDTH,
  CATEGORY_INDENT,
  MAXIMUM_CELL_WIDTH,
} from './sizes';

const getStyles = (isPrintMode, cellCharacters) => {
  const COLOR_ONE = isPrintMode ? WHITE : DARK_BLUE;
  const COLOR_ONE_BORDER = isPrintMode ? 'rgba(255,255,255,0.8)' : 'rgba(38,40,52,0.8)';
  const COLOR_TWO = isPrintMode ? DARK_BLUE : WHITE;
  const COLOR_THREE = isPrintMode ? WHITE : '#3F404B';
  const COLOR_CATEGORY_EXPANDED = isPrintMode ? WHITE : '#36363F';
  const BORDER_COLOR = isPrintMode ? 'black' : '#525258';
  const HIGHLIGHTED_COLOR = isPrintMode ? WHITE : '#3F404B';
  const OVERLAY_BG = isPrintMode ? WHITE : TRANS_BLACK;
  const CELL_WIDTH = Math.min(
    MAXIMUM_CELL_WIDTH,
    Math.max(MINIMUM_CELL_WIDTH, cellCharacters * CELL_WIDTH_PER_CHARACTER),
  );

  const styles = {
    wrapper: {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: COLOR_ONE,
      color: COLOR_TWO,
    },
    verticalScroller: {
      overflowX: 'hidden',
      overflowY: 'scroll',
      flex: 1,
    },
    gridWrapper: {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'transform 0.1s linear',
      height: '100%',
    },
    contentWrapper: {
      overflow: 'visible',
      transition: 'transform 0.1s linear',
      minWidth: '100%',
    },
    contentInner: {
      position: 'relative',
      overflow: 'hidden',
    },
    gridCell: {
      position: 'relative',
      flexBasis: CELL_WIDTH,
      minWidth: CELL_WIDTH, // ie ignores flex-basis
      maxWidth: CELL_WIDTH, // ie ignores flex-basis
      borderLeft: `1px solid ${BORDER_COLOR}`,
      padding: 10,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1, // Above active column filler.
    },
    descriptionCell: {
      flexBasis: DESCRIPTION_CELL_WIDTH,
      minWidth: DESCRIPTION_CELL_WIDTH, // ie ignores flex-basis
      maxWidth: DESCRIPTION_CELL_WIDTH, // ie ignores flex-basis
      borderRight: 'none',
      paddingTop: 10,
      paddingBottom: 10,
      paddingRight: 10,
      boxSizing: 'border-box',
      justifyContent: 'flex-start',
      flexDirection: 'row',
    },
    gridHeader: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      borderBottom: `1px solid ${BORDER_COLOR}`,
      backgroundColor: COLOR_THREE,
      minHeight: LABEL_WIDTH,
      minWidth: '100%',
      // Move the grid header on top of the table content but make it,
      // not respond to mouse events so that users can scroll the table
      // from the grid header.
      position: 'relative',
      zIndex: 2, // Above floating first column cells.
      transition: 'transform 0.1s linear',
    },
    cellIndicator: {
      cursor: 'pointer',
      width: 20,
      height: 20,
      borderRadius: 20,
      display: 'inline-block',
      position: 'relative',
      border: '6px solid transparent',
      borderColor: COLOR_ONE_BORDER,
    },
    cellIndicatorActive: {
      transform: 'scaleX(1.2) scaleY(1.2)',
    },
    headerCell: {
      position: 'relative',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'stretch',
      width: CELL_WIDTH,
      pointerEvents: 'none',
      boxSizing: 'border-box',
    },
    headerCellButton: {
      pointerEvents: 'all',
      cursor: 'pointer',
      userSelect: 'none',
      width: MINIMUM_CELL_WIDTH,
    },
    headerColumnChanger: {
      fontWeight: 'bold',
    },
    headerColumnChangerIcon: {
      width: 14,
      height: 12,
    },
    descriptionHeaderCell: {
      justifyContent: 'flex-end',
      flexBasis: DESCRIPTION_CELL_WIDTH,
      minWidth: DESCRIPTION_CELL_WIDTH, // ie ignores flex-basis
      maxWidth: DESCRIPTION_CELL_WIDTH, // ie ignores flex-basis
      pointerEvents: 'all',
      flexDirection: 'column',
      fontSize: 20,
      padding: 20,
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      borderBottom: `1px solid ${BORDER_COLOR}`,
      flex: 1,
      width: '100%',
      position: 'relative',
    },
    rowHighlighted: {
      backgroundColor: HIGHLIGHTED_COLOR,
      zIndex: 2,
      cursor: 'pointer',
    },
    collapsibleHeader: {
      outline: 'none',
      border: 'none',
      background: 'transparent',
      color: 'inherit',
      fontSize: 20,
      fontWeight: 'medium',
      flexBasis: DESCRIPTION_CELL_WIDTH,
      minWidth: DESCRIPTION_CELL_WIDTH, // ie ignores flex-basis
      maxWidth: DESCRIPTION_CELL_WIDTH, // ie ignores flex-basis
      boxSizing: 'border-box',
      textAlign: 'left',
      position: 'relative',
      display: 'flex',
      paddingTop: 15,
      paddingBottom: 15,
    },
    collapsibleHeaderInner: {
      cursor: 'pointer',
    },
    collapsibleIcon: {
      width: CATEGORY_INDENT,
      minWidth: CATEGORY_INDENT,
      fontSize: 25,
    },
    clinicLabel: {
      transform: 'rotate(-45deg)',
      transformOrigin: 'left bottom',
      textAlign: 'left',
      width: LABEL_WIDTH,
      height: MINIMUM_CELL_WIDTH,
      position: 'absolute',
      bottom: 0,
      left: '65%',
    },
    facilityTypeLabel: {
      fontWeight: 'bold',
    },
    categorySectionExpanded: {
      backgroundColor: COLOR_CATEGORY_EXPANDED,
      width: '100%',
    },
    columnChanger: {
      fontSize: 45,
      cursor: 'pointer',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchBox: {
      display: isPrintMode ? 'none' : 'block',
      position: 'relative',
      width: '100%',
      fontSize: 14,
      marginTop: 20,
    },
    searchBoxIcon: {
      position: 'absolute',
      top: 10,
      right: 15,
      fontSize: 25,
    },
    searchBoxInput: {
      display: 'block',
      width: '100%',
      height: 45,
      lineHeight: '45px',
      background: 'transparent',
      color: 'inherit',
      border: '1px solid #979797',
      borderRadius: 4,
      paddingLeft: 10,
      boxSizing: 'border-box',
    },
    noResults: {
      fontSize: 18,
      margin: 20,
    },
    tableTitle: {
      flex: 1,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    tableTitleText: {
      flexGrow: 1,
      paddingRight: 10,
    },
    columnActiveStrip: {
      position: 'absolute',
      top: -1000,
      left: 0,
      right: 0,
      height: 2000,
      pointerEvents: 'none',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    descriptionOverlay: {
      position: 'absolute',
      bottom: '0',
      top: 0,
      left: 0,
      right: 0,
      boxSizing: 'border-box',
      backgroundColor: OVERLAY_BG,
      textAlign: 'center',
      padding: 15,
      zIndex: DIALOG_Z_INDEX,
      fontSize: 16,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: COLOR_TWO,
      overflowY: 'auto',
    },
    descriptionOverlayHeader: {
      display: 'block',
      marginBottom: 10,
      fontSize: 14,
    },
    descriptionOverlayBody: {
      maxWidth: 700,
      textAlign: 'left',
    },
    descriptionOverlayBackButton: {
      marginTop: 20,
      display: isPrintMode ? 'none' : 'block',
    },
    descriptionOverlayIcon: {
      marginBottom: 10,
    },
    descriptionOverlayMainTitle: {
      position: 'absolute',
      top: 20,
    },
  };

  const gridCellChanger = {
    ...styles.gridCell,
    flexBasis: MINIMUM_CELL_WIDTH,
    minWidth: MINIMUM_CELL_WIDTH, // ie ignores flex-basis
    maxWidth: MINIMUM_CELL_WIDTH, // ie ignores flex-basis
  };

  const combinedStyles = {
    cellIndicatorActive: { ...styles.cellIndicator, ...styles.cellIndicatorActive },
    gridCellChanger,
    gridCellChangerActive: { ...gridCellChanger, backgroundColor: COLOR_ONE },
    collapsibleIconClosed: { ...styles.collapsibleIcon, transform: 'rotate(-90deg)' },
    columnChangerDisabled: { ...styles.columnChanger, opacity: 0.3 },
    headerColumnChangerDisabled: { ...styles.headerColumnChanger, opacity: 0.3 },
  };

  return { ...styles, ...combinedStyles, CELL_WIDTH };
};

export default getStyles;
