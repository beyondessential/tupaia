/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { SolidButton } from './SolidButton';

export const ArmedIncidentManagement = () => (
  <>
    <hr />
    <p>
      <b>
        Armed Incident Management (AIM) helps law enforcement, local authorities, violence reduction
        NGOs and affected communities to reduce and prevent illicit arms activity.
      </b>
    </p>
    <p>AIM includes gathering, tracking, analyzing and following up reported:</p>
    <ul>
      <li>
        <em>incidents</em> of armed violence, illicit arms possession and trafficking – through new
        and existing reporting options;
      </li>
      <li>
        <em>responses</em> by law enforcement to these incidents – enabling greater oversight by
        relevant authorities and coordination; and
      </li>
      <li>
        <em>prevention</em> and safety measures undertaken by communities and authorities –
        including reports on their effectiveness and promotion of what works.  
      </li>
    </ul>
    <p>
      The data in this demonstration is a mixture of actual violent incident reports over the past
      two years across Nigeria sourced from ACLED and dummy data to demonstrate various functions,
      especially regarding response and prevention. Do not rely on this data – it is for
      demonstration and training purposes only. Actual AIM projects on Tupaia have restricted
      access.
    </p>
    <section>
      <a target="_blank" rel="noopener noreferrer" href="https://armedviolencereduction.org/">
        <SolidButton>More information</SolidButton>
      </a>
    </section>
  </>
);
