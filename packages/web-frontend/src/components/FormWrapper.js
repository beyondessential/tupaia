/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { isMobile } from '../utils';

import Overlay from './mobile/Overlay';
import { DARK_BLUE, MOBILE_MARGIN_SIZE } from '../styles';

/* CHECK: Online says that parents and children
 * "shouldn’t care whether [a Component] is defined as a function or a class"
 * but just make sure we don't.
 * Also airbnb says don't use arrow functions here but I went with what was already in the code.
 * https://github.com/airbnb/javascript/tree/master/react#class-vs-reactcreateclass-vs-stateless
 */
//export function FormWrapper(props) {
export const FormWrapper = props => {
  const { titleText, onClose, style } = props;

  if (isMobile()) {
    return (
      <Overlay
        titleText={titleText}
        onClose={onClose}
        style={style}
        contentStyle={styles.mobileContentStyle}
      >
        {props.children}
      </Overlay>
    );
  }

  return <div style={style}>{props.children}</div>;
};

const styles = {
  mobileContentStyle: {
    background: DARK_BLUE,
    padding: `0 ${MOBILE_MARGIN_SIZE}px`,
    borderTop: '1px solid #111',
  },
};
