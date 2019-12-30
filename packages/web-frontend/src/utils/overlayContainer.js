/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import styled from 'styled-components';
import { DIALOG_Z_INDEX } from '../styles';

export const OverlayContainer = styled.div`
  position: fixed;
  z-index: ${DIALOG_Z_INDEX};
  flex-direction: column;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
  pointer-events: visiblePainted; /* IE 9-10 doesn't have auto */
  pointer-events: none;
  display: flex; /* Took me ages to find this, is the magic touch */
  align-items: stretch;
  align-content: stretch;
`;

export const OverlayView = styled.div`
  flex-direction: column;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
  display: flex; /* Took me ages to find this, is the magic touch */
  align-items: stretch;
  align-content: stretch;
`;
