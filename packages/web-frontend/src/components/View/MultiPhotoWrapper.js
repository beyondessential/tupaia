/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * MultiPhotoWrapper
 *
 * Renders multi photograph view
 * @prop {object} viewContent An object with the following structure
  {
    "data": [
        {
            "name": "IjcqInEsg7L",
            "dataElement": "IjcqInEsg7L",
            "value": "https://tupaia.s3.amazonaws.com/uploads/images/1518645718357_317304.png"
        },
        {
            "name": "LcWFBuWRA5A",
            "dataElement": "LcWFBuWRA5A",
            "value": "https://tupaia.s3.amazonaws.com/uploads/images/1518645718376_359169.png"
        },
        {
            "name": "bjX5sjEWsyE",
            "dataElement": "bjX5sjEWsyE",
            "value": "https://tupaia.s3.amazonaws.com/uploads/images/1518645718379_14885.png"
        }
    ],
    "type": "view",
    "viewType": "multiPhotograph",
    "name": "Post-Disaster Photos of the Facility",
 }
 * @return {React Component} a view with a list photographs
 */
import React from 'react';
import PropTypes from 'prop-types';
import ZoomIcon from '@material-ui/icons/ZoomIn';
import Dialog from '@material-ui/core/Dialog';

import { VIEW_STYLES } from '../../styles';
import { VIEW_CONTENT_SHAPE } from '.';
import Carousel from '../Carousel';
import Slide from '../Carousel/Slide';
import { ViewTitle } from './Typography';
import { ChartViewContainer } from './Layout';

const MAX_THUMBNAILS = 3;

const getThumbProportions = numberOfThumbs => {
  if (numberOfThumbs === 3) {
    return [15, 70, 15];
  }
  if (numberOfThumbs === 2) {
    return [50, 50];
  }
  return [100];
};
export class MultiPhotoWrapper extends React.Component {
  static propTypes = {
    viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isEnlarged: false,
      showIcon: false,
    };
  }

  toggleEnlarge() {
    this.setState(prevState => ({ isEnlarged: !prevState.isEnlarged }));
  }

  toggleIcon() {
    this.setState(prevState => ({ showIcon: !prevState.showIcon }));
  }

  renderEnlargePopup() {
    const { isEnlarged } = this.state;
    const { data } = this.props.viewContent;
    if (!isEnlarged || !data || !data.length) return null;
    const imageUrls = data.map(({ value }) => value);
    const child = data.length > 1 ? <Carousel images={imageUrls} /> : <Slide url={imageUrls[0]} />;

    return (
      <Dialog open style={VIEW_STYLES.multiPhotoDialog} onClose={() => this.toggleEnlarge()}>
        {child}
      </Dialog>
    );
  }

  render() {
    const { viewContent } = this.props;
    const { showIcon } = this.state;
    const { data, name } = viewContent;
    const thumbnails = data.slice(0, MAX_THUMBNAILS).map(({ value }) => value);
    const containerStyle = {
      ...VIEW_STYLES.chartViewContainer,
      flexDirection: 'row',
      display: 'flex',
    };
    const thumbnailProportions = getThumbProportions(thumbnails.length);
    return (
      <ChartViewContainer>
        <ViewTitle>{name}</ViewTitle>
        <div
          style={containerStyle}
          tabIndex={0}
          role="button"
          onMouseEnter={() => this.toggleIcon()}
          onMouseLeave={() => this.toggleIcon()}
          onClick={() => this.toggleEnlarge()}
          onKeyPress={() => this.toggleEnlarge()}
        >
          {thumbnails.map((value, index) => (
            <div
              style={{
                ...VIEW_STYLES.multiPhotoImageWrapper,
                width: `${thumbnailProportions[index]}%`,
                backgroundImage: `url('${value}')`,
              }}
              key={value}
            />
          ))}
          {showIcon && <ZoomIcon style={VIEW_STYLES.multiPhotoZoomIcon} />}
        </div>
        {this.renderEnlargePopup()}
      </ChartViewContainer>
    );
  }
}
export default MultiPhotoWrapper;
