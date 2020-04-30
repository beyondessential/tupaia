/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * ListWrapper
 *
 * Renders view with values and keys from data provided by viewContent object
 * @prop {object} viewContent An object with the following structure
   {
    "type": "view",
    "viewType": "list",
    "name": "Suggestions",
    "data": [{"dataElementCode" : "foo", "value": "Staff training required"},
             ... ],
  }
 * @return {React Component} a view with a list of values
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { WHITE, BLUE } from '../../styles';

export class ListWrapper extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hoveredRow: null,
    };
  }

  render() {
    const { onItemClick, viewContent, renderItem } = this.props;
    const { data, valueTranslationOptions } = viewContent;

    if (!data || data.length === 0) {
      return (
        <div style={styles.wrapper}>
          <div style={styles.row}>No Data</div>
        </div>
      );
    }

    const items = data.map(item => {
      const { dataElementCode } = item;
      let { value } = item;
      if (valueTranslationOptions) {
        const { match, replace } = valueTranslationOptions;
        value = value.replace(new RegExp(match), replace);
      }
      const rowStyle =
        this.state.hoveredRow === dataElementCode
          ? { ...styles.row, ...styles.rowHovered }
          : styles.row;

      return (
        <div
          key={dataElementCode}
          style={rowStyle}
          onMouseEnter={() => this.setState({ hoveredRow: dataElementCode })}
          onMouseLeave={() => this.setState({ hoveredRow: null })}
          onClick={() => onItemClick(item)}
        >
          {renderItem ? renderItem(item) : <div>{value}</div>}
        </div>
      );
    });

    return <div style={styles.wrapper}>{items}</div>;
  }
}

const styles = {
  wrapper: {},
  row: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    padding: 5,
    alignItems: 'center',
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    cursor: 'pointer',
    color: WHITE,
  },
  rowHovered: {
    color: BLUE,
  },
};

ListWrapper.propTypes = {
  viewContent: PropTypes.object.isRequired,
  onItemClick: PropTypes.func,
  renderItem: PropTypes.func,
};

ListWrapper.defaultProps = {
  onItemClick: () => {},
  renderItem: null,
};

export default ListWrapper;
