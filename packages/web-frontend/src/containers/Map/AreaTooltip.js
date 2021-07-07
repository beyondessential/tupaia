/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * AreaTooltip
 *
 * Wrapper around react-leaflet's tooltip component that allows for updating
 * the opacity without completely re-creating the component.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Tooltip } from 'react-leaflet';
import { getSingleFormattedValue } from '../../utils';

const Heading = styled.span`
  text-align: center;
  font-weight: ${props => (props.hasMeasureValue ? 'bold' : 'normal')};
`;

export class AreaTooltip extends Component {
  constructor(props) {
    super(props);
    this.ref = null;
  }

  componentDidMount() {
    const { leafletElement } = this.ref;
    if (leafletElement) {
      // componentDidMount will get called before leaflet has fully finished
      // calculating the map layout (and it appears the same is true for the
      // native leafletElement `add` event), so call `update` after a tiny delay
      // to ensure the tooltip lands in the correct position.
      setTimeout(() => leafletElement.update(), 10);
    }
  }

  getTextList() {
    const {
      orgUnitName,
      hasMeasureValue,
      measureOptions,
      rawOrgUnitMeasureData,
      orgUnitMeasureData,
    } = this.props;

    const textList = [
      <Heading key={0} hasMeasureValue={hasMeasureValue}>
        {orgUnitName}
      </Heading>,
    ];
    const renderTextList = data => {
      Object.keys(data).forEach(key => {
        textList.push(<span key={key}>{`${key}: ${data[key]}`}</span>);
      });
    };

    if (hasMeasureValue) {
      const legacy = !measureOptions[0].notLegacy;
      const formattedMeasureData = legacy
        ? this.buildLegacyFormattedMeasureData(orgUnitMeasureData, measureOptions)
        : this.buildFormattedMeasureData(rawOrgUnitMeasureData, measureOptions);

      renderTextList(formattedMeasureData);
    }

    return textList;
  }

  buildLegacyFormattedMeasureData(orgUnitMeasureData, measureOptions) {
    const formattedMeasureData = {};

    formattedMeasureData[measureOptions[0].name] = getSingleFormattedValue(
      orgUnitMeasureData,
      measureOptions,
    );

    return formattedMeasureData;
  }

  buildFormattedMeasureData(rawOrgUnitMeasureData, measureOptions) {
    const formattedMeasureData = {};

    if (rawOrgUnitMeasureData) {
      formattedMeasureData[measureOptions[0].name] = getSingleFormattedValue(
        rawOrgUnitMeasureData,
        measureOptions,
      );

      Object.keys(rawOrgUnitMeasureData).forEach(key => {
        if (key !== measureOptions[0].key && key !== 'organisationUnitCode') {
          formattedMeasureData[key] = rawOrgUnitMeasureData[key];
        }
      });
    }

    return formattedMeasureData;
  }

  render() {
    const { permanent, onMouseOver, onMouseOut, sticky } = this.props;

    const textList = this.getTextList();

    return (
      <Tooltip
        pane="tooltipPane"
        direction="auto"
        opacity={1}
        sticky={sticky}
        permanent={permanent}
        interactive={permanent}
        onMouseOver={onMouseOver}
        onFocus={onMouseOver}
        onMouseOut={onMouseOut}
        onBlur={onMouseOut}
        ref={r => {
          this.ref = r;
        }}
      >
        <div style={{ display: 'grid' }}>{textList}</div>
      </Tooltip>
    );
  }
}

AreaTooltip.propTypes = {
  permanent: PropTypes.bool,
  sticky: PropTypes.bool,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
  hasMeasureValue: PropTypes.bool,
  measureOptions: PropTypes.arrayOf(PropTypes.object),
  orgUnitMeasureData: PropTypes.object,
  rawOrgUnitMeasureData: PropTypes.object,
  orgUnitName: PropTypes.string,
};

AreaTooltip.defaultProps = {
  permanent: false,
  sticky: false,
  onMouseOver: undefined,
  onMouseOut: undefined,
  hasMeasureValue: false,
  measureOptions: [],
  orgUnitMeasureData: undefined,
  rawOrgUnitMeasureData: undefined,
  orgUnitName: undefined,
};
