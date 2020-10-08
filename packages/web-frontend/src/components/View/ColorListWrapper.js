/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * ColorListWrapper
 *
 * Renders view with values and keys from data provided by viewContent object
 * @prop {object} viewContent An object with the following structure
   {
    "type": "view",
    "viewType": "colorList",
    "name": "Service offered",
    "data": [{"code" : "foo", "name": "Vaccinations", "value": 0},
             ... ],
    "presentationOptions": {
      0: {
        "color": "#FFF999",
        "label": "Green",
      },
      ...
    }
  }
 * @return {React Component} a view with a list of values/icon -> names
 */

import React from 'react';
import PropTypes from 'prop-types';
import { VIEW_CONTENT_SHAPE, PRESENTATION_OPTIONS_SHAPE } from './propTypes';
import { ListWrapper } from './ListWrapper';

class ColorListItem extends React.PureComponent {
  render() {
    const { name, value, presentationOptions } = this.props;
    const backgroundColor = presentationOptions[value] ? presentationOptions[value].color : 'grey';
    return (
      <>
        <div style={styles.nameColumn}>{name}</div>
        <div style={{ ...styles.indicator, backgroundColor }} />
      </>
    );
  }
}

ColorListItem.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  presentationOptions: PropTypes.shape(PRESENTATION_OPTIONS_SHAPE).isRequired,
};

export const ColorListWrapper = props => {
  const { viewContent } = props;
  const { presentationOptions } = viewContent;
  const renderItem = ({ name, value }) => (
    <ColorListItem name={name} value={value} presentationOptions={presentationOptions} />
  );
  return <ListWrapper {...props} renderItem={renderItem} />;
};

const styles = {
  nameColumn: {
    paddingRight: 20,
  },
  indicator: {
    borderRadius: '50%',
    height: 25,
    width: 25,
    border: '6px solid rgba(38,40,52,0.8)',
    minWidth: 25,
    marginLeft: 'auto',
  },
};

ColorListWrapper.propTypes = {
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE).isRequired,
};
