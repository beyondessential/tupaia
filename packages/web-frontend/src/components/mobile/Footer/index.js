/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { DARK_BLUE, WHITE } from '../../../styles';
import appStoreButton from '../../../images/app-store-button.png';
import playStoreButton from '../../../images/play-store-button.png';

const Footer = () => (
  <div>
    <div style={styles.wrapper}>
      <h2 style={styles.header}>Interested in learning more?</h2>
      <ul style={styles.content}>
        <li style={styles.listItem}>
          Learn about{' '}
          <a
            href="http://info.tupaia.org/"
            rel="noopener noreferrer"
            target="_blank"
            style={styles.link}
          >
            the project
          </a>{' '}
          and how Tupaia is crowd sourcing clinic data from around the world.
        </li>
        <li style={styles.listItem}>
          Access free{' '}
          <a
            href="http://info.tupaia.org/procurement/"
            rel="noopener noreferrer"
            target="_blank"
            style={styles.link}
          >
            Tupaia procurement resources
          </a>
          .
        </li>
        <li style={styles.listItem}>
          Discover the little-known (completely fake) country called{' '}
          <a
            href="http://info.tupaia.org/demo-land/"
            rel="noopener noreferrer"
            target="_blank"
            style={styles.link}
          >
            Demo Land
          </a>
          !
        </li>
      </ul>
    </div>
    <div style={{ ...styles.wrapper, ...styles.wrapper2 }}>
      <h2 style={styles.header}>Contribute to Tupaia</h2>
      <p style={styles.paragraph}>
        Download the Tupaia app to survey clinics and help add more data to Tupaia.
      </p>
      <a
        href="https://itunes.apple.com/us/app/tupaia-meditrak/id1245053537"
        target="_blank"
        rel="noreferrer noopener"
      >
        <img src={appStoreButton} style={styles.appStoreIcon} alt="Apple app store logo" />
      </a>
      <a
        href="https://play.google.com/store/apps/details?id=com.tupaiameditrak"
        target="_blank"
        rel="noreferrer noopener"
      >
        <img src={playStoreButton} style={styles.appStoreIcon} alt="Google play store logo" />
      </a>
    </div>
    <div style={styles.wrapper}>
      <p style={styles.smallParagraph}>© 2017 Beyond Essential Systems</p>
      <p style={styles.smallParagraph}>
        Map used on this site: ©{' '}
        <a
          href="https://www.mapbox.com/about/maps/"
          style={styles.link}
          target="_blank"
          rel="noreferrer noopener"
        >
          Mapbox
        </a>{' '}
        ©{' '}
        <a
          href="http://www.openstreetmap.org/copyright"
          style={styles.link}
          target="_blank"
          rel="noreferrer noopener"
        >
          OpenStreetMap
        </a>
      </p>
    </div>
  </div>
);

const styles = {
  header: {
    fontSize: 18,
    margin: 0,
  },
  content: {
    fontSize: 16,
    paddingLeft: 17,
  },
  paragraph: {
    marginTop: 5,
  },
  smallParagraph: {
    fontSize: 12,
    margin: '5px 0',
  },
  link: {
    color: 'inherit',
    whiteSpace: 'nowrap',
    outline: 'none',
    textDecoration: 'underline',
    background: 'none',
    border: 0,
    padding: 0,
    cursor: 'pointer',
  },
  wrapper: {
    padding: 16,
    borderTop: '1px solid #eee',
    background: '#f4f4f4',
    color: DARK_BLUE,
    lineHeight: '140%',
  },
  wrapper2: {
    background: '#1080c3',
    color: WHITE,
  },
  appStoreIcon: {
    height: 44,
    width: 'auto',
    marginRight: 5,
  },
};

export default Footer;
