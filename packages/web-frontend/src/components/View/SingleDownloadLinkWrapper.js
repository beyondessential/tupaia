/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * SingleDownloadLinkWrapper
 *
 * Renders view with single download link from data provided by viewContent object
 * @prop {object} viewContent An object with the following structure
   {
    "viewType": "singleDownloadLink",
    "name": "Download full survey response",
    "value:  "{full link}"
  }
 * @return {React Component} a view with one download link
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { VIEW_STYLES } from '../../styles';

class SingleDownloadLinkWrapperComponent extends PureComponent {
  render() {
    const { name, value } = this.props.viewContent;
    const { isUserLoggedIn } = this.props;

    return (
      <div style={VIEW_STYLES.viewContainer}>
        {!isUserLoggedIn && value.includes('/export/') ? ( // Data exports should always require user to be logged in.
          <div style={VIEW_STYLES.downloadLink}>Please log in to enable exports</div>
        ) : (
          <a
            style={VIEW_STYLES.downloadLink}
            rel="noreferrer noopener"
            href={value}
            download
            target="_blank"
          >
            {name}
          </a>
        )}
      </div>
    );
  }
}

SingleDownloadLinkWrapperComponent.propTypes = {
  viewContent: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  const { isUserLoggedIn } = state.authentication;

  return {
    isUserLoggedIn,
  };
};

export const SingleDownloadLinkWrapper = connect(
  mapStateToProps,
  null,
)(SingleDownloadLinkWrapperComponent);
