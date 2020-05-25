/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import Markdown from 'markdown-to-jsx';

const DescriptionOverlay = ({ mainTitle, header, body, color, styles, onClose }) => (
  <div style={styles.descriptionOverlay} onClick={onClose}>
    {mainTitle ? <div style={styles.descriptionOverlayMainTitle}>{mainTitle}</div> : null}

    <div onClick={e => e.stopPropagation()}>
      {color ? (
        <div style={styles.descriptionOverlayIcon}>
          <div style={{ ...styles.cellIndicator, backgroundColor: color }} />
        </div>
      ) : null}
      {header ? <strong style={styles.descriptionOverlayHeader}>{header}</strong> : null}
      <div style={styles.descriptionOverlayBody}>
        <Markdown>{body.replace(/\\n/g, '\n\n')}</Markdown>
      </div>
    </div>
    <RaisedButton
      label="Back to chart"
      onClick={onClose}
      style={styles.descriptionOverlayBackButton}
    />
  </div>
);

DescriptionOverlay.propTypes = {
  mainTitle: PropTypes.string,
  header: PropTypes.string,
  body: PropTypes.string,
  color: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
};
DescriptionOverlay.defaultProps = {
  mainTitle: '',
  header: '',
  body: '',
  color: '',
};

export default DescriptionOverlay;
