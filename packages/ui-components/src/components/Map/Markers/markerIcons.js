/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

/* eslint-disable react/prop-types */

import L from 'leaflet';
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';
import styled from 'styled-components';
import Warning from '@material-ui/icons/Warning';
import Help from '@material-ui/icons/Help';
import CheckBox from '@material-ui/icons/CheckBox';
import { ICON_BASE_SIZE } from './constants';
// from https://thenounproject.com/ochavisual/collection/ocha-humanitarian-icons/
import { Cyclone, Earthquake, Tsunami, Volcano, Flood } from './disasterIcons';
import { UpArrowIcon, DownArrowIcon, RightArrowIcon } from './arrowIcons';
import { BREWER_PALETTE, WHITE } from '../constants';
import { IconContainer } from './IconContainer';

// allows passing a color to a material icon & scales it down a bit
const wrapMaterialIcon = Base => ({ color }) => <Base htmlColor={color} viewBox="-3 -3 29 29" />;

const StyledSvgWrapper = styled.span`
  * {
    fill: ${p => p.color};
  }
`;

const wrapSvgIcon = Base => ({ color }) => (
  <StyledSvgWrapper color={color}>
    <Base />
  </StyledSvgWrapper>
);

const PinIcon = ({ color, scale }) => {
  return (
    <IconContainer fill={color} scale={scale} viewBox="0 0 27 39">
      <path
        d="M13.5 0.631592C6.04607 0.631592 0 6.64584 0 14.0605C0 24.1322 13.5 39 13.5 39C13.5 39 27 24.1322 27 14.0605C27 6.64584 20.9539 0.631592 13.5 0.631592Z"
        fill={color}
      />
      <circle cx="13.5" cy="14.1316" r="6" fill="white" fillOpacity="0.9" />
    </IconContainer>
  );
};

const ArrowIcon = ({ direction, scale }) => {
  const arrowIconComponents = {
    up: UpArrowIcon,
    down: DownArrowIcon,
    right: RightArrowIcon,
  };

  return arrowIconComponents[direction](scale);
};

const HealthPinIcon = ({ color, scale }) => (
  <IconContainer fill={color} scale={scale}>
    <ellipse ry="271" rx="270" id="svg_6" cy="397" cx="501" stroke="#000" fill={WHITE} />
    <g>
      <g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)">
        <path d="M4423,4979.6c-625.3-97.6-1272.7-370.3-1773.9-749.5c-219.5-166.3-636.4-598.7-802.7-833.7c-516.6-727.3-765-1618.7-700.7-2505.6c97.6-1350.4,1028.8-2957.9,2678.5-4614.3c350.3-350.4,911.3-867,1102-1011.1l73.2-55.4l153,124.2c663,543.2,1530,1427.9,2102,2146.4C8877.6-481.7,9263.4,1247.8,8456.4,2875.3c-534.4,1079.8-1521.1,1833.7-2716.3,2075.4C5423,5015.1,4740.1,5030.6,4423,4979.6z M5456.3,3806.6C6545,3618.1,7416.4,2773.3,7638.1,1689.1c93.1-454.6,53.2-1006.7-102-1445.7c-175.2-487.8-507.8-935.7-933.5-1257.2c-208.4-157.4-638.6-365.9-893.6-434.6c-924.6-243.9-1902.5,6.6-2578.8,663c-1071,1035.5-1102,2734-71,3800.5c390.3,408,862.5,665.2,1419.1,780.5C4733.4,3846.5,5188,3853.2,5456.3,3806.6z" />
        <path d="M4445.2,2265.6v-554.3h-565.4h-565.4v-554.3V602.6h565.4h565.4V37.2v-565.4h554.3h554.4V37.2v565.4h565.4h565.4l-4.5,549.9l-6.6,547.7l-558.8,6.7l-561,4.4v554.3v554.3h-554.4h-554.3V2265.6z" />
      </g>
    </g>
  </IconContainer>
);

const CircleIcon = ({ color, scale }) => (
  <IconContainer scale={scale}>
    <circle cx="500" cy="500" r="400" stroke={WHITE} strokeWidth="80" fill={color} />
  </IconContainer>
);

const RadiusIcon = ({ color, scale }) => (
  <IconContainer scale={scale}>
    <circle
      cx="500"
      cy="500"
      r="400"
      stroke={color}
      strokeWidth="150"
      fill={color}
      fillOpacity="0.5"
    />
  </IconContainer>
);

const DottedCircle = ({ color, scale }) => (
  <IconContainer scale={scale}>
    <circle
      cx="500"
      cy="500"
      r="300"
      stroke={color}
      strokeWidth="180"
      strokeDasharray="120 150"
      fill="none"
    />
  </IconContainer>
);

const SquareIcon = ({ color, scale, stroke = color }) => (
  <IconContainer scale={scale}>
    <rect
      width="800"
      height="800"
      x="100"
      y="100"
      strokeWidth="100"
      fill={color}
      fillOpacity="0.6"
      stroke={stroke}
      strokeOpacity="1"
      strokeLinejoin="round"
      rx="15%"
      ry="15%"
    />
  </IconContainer>
);

const RingIcon = ({ color, scale }) => (
  <IconContainer scale={scale}>
    <path
      d="M 500, 500
      m 0, -400
      a 400, 400, 0, 1, 0, 1, 0
      Z
      m 0 200
      a 200, 200, 0, 1, 1, -1, 0
      Z
    "
      stroke={WHITE}
      strokeWidth="80"
      fill={color}
    />
  </IconContainer>
);

// just loop around a circle dropping points at the right places
const TAU = Math.PI * 2;
function makePolygon(numberOfPoints, radius) {
  const offset = TAU * 0.5; // start pointing up
  const coords = new Array(numberOfPoints + 1)
    .fill(0)
    .map((_, i) => ({
      x: Math.sin(offset + (i / numberOfPoints) * TAU) * radius,
      y: Math.cos(offset + (i / numberOfPoints) * TAU) * radius,
    }))
    .map(c => `${c.x},${c.y}`);

  // move to the first coordinate, line to all the others
  // (we go to numberOfPoints+1 above so that we get a line back to the starting pos)
  return `M${coords.join('L')}`;
}

const pentagonPath = makePolygon(5, 3);
const PentagonIcon = ({ color, scale }) => (
  <IconContainer viewBox="-4 -4 8 8" scale={scale}>
    <path d={pentagonPath} fill={color} stroke={WHITE} strokeWidth="0.4" />
  </IconContainer>
);

const trianglePath = makePolygon(3, 3);
const TriangleIcon = ({ color, scale }) => (
  <IconContainer viewBox="-4 -4 8 8" scale={scale}>
    <path d={trianglePath} fill={color} stroke={WHITE} strokeWidth="0.4" />
  </IconContainer>
);

const XIcon = ({ color, scale }) => (
  <IconContainer viewBox="-4 -4 8 8" scale={scale}>
    <g transform="rotate(45)">
      <path
        d="M1,-3 L1,-1 L3,-1 L3,1 L1,1 L1,3 L-1,3 L-1,1 L-3,1 L-3,-1 L-1,-1 L-1,-3 L1,-3"
        fill={color}
        stroke={WHITE}
        strokeWidth="0.4"
      />
    </g>
  </IconContainer>
);

const HIcon = ({ color, h = 0.24, v = 0.2, scale }) => (
  <IconContainer viewBox="-1.5 -1.5 3 3" scale={scale}>
    <path
      d={`
        M-1,-1 L-${h},-1 L-${h},-${v} L${h},-${v} L${h},-1 L1,-1
        L1,1 L${h},1 L${h},${v} L-${h},${v} L-${h},1 L-1,1
        L-1,-1
      `}
      fill={color}
      stroke={WHITE}
      strokeWidth="0.2"
    />
  </IconContainer>
);

const FadedCircle = ({ color, scale }) => {
  // Each color needs its own id - even though we're defining a new svg, the
  // ids we refer to them by are in document scope, not svg scope.
  // We replace non-word characters (punctuation and spaces) with '-' so that
  // it's guaranteed to make a legal ID.
  const gradientId = `fade-${color}`.replace(/\W/g, '-');

  return (
    <IconContainer scale={scale}>
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop style={{ stopColor: color, stopOpacity: 1 }} offset="0%" />
          <stop style={{ stopColor: color, stopOpacity: 0.7 }} offset="50%" />
          <stop style={{ stopColor: color, stopOpacity: 0 }} offset="100%" />
        </radialGradient>
      </defs>
      <circle cx="500" cy="500" r="500" stroke="none" fill={`url(#${gradientId})`} />
    </IconContainer>
  );
};

const icons = {
  pin: {
    Component: PinIcon,
    iconAnchor: [10, 24],
    popupAnchor: [0, -30],
  },
  arrow: {
    Component: ArrowIcon,
    iconAnchor: [10, 24],
    popupAnchor: [0, -30],
  },
  healthPin: {
    Component: HealthPinIcon,
    iconAnchor: [12, 24],
    popupAnchor: [0, -30],
  },
  circle: {
    Component: CircleIcon,
  },
  square: {
    Component: SquareIcon,
  },
  triangle: {
    Component: TriangleIcon,
  },
  pentagon: {
    Component: PentagonIcon,
  },
  radius: {
    Component: RadiusIcon,
  },
  ring: {
    Component: RingIcon,
  },
  h: {
    Component: HIcon,
  },
  x: {
    Component: XIcon,
  },
  empty: {
    Component: DottedCircle,
  },
  fade: {
    Component: FadedCircle,
  },
  warning: {
    Component: wrapMaterialIcon(Warning),
  },
  help: {
    Component: wrapMaterialIcon(Help),
  },
  checkbox: {
    Component: wrapMaterialIcon(CheckBox),
  },
  earthquake: {
    Component: wrapSvgIcon(Earthquake),
  },
  tsunami: {
    Component: wrapSvgIcon(Tsunami),
  },
  eruption: {
    Component: wrapSvgIcon(Volcano),
  },
  cyclone: {
    Component: wrapSvgIcon(Cyclone),
  },
  flood: {
    Component: wrapSvgIcon(Flood),
  },
  hidden: {
    Component: () => null,
  },
};

export const ICON_VALUES = Object.keys(icons);
export const SPECTRUM_ICON = 'fade';
export const UNKNOWN_ICON = 'empty';
export const DEFAULT_ICON = 'healthPin';
export const LEGEND_COLOR_ICON = 'circle';
export const LEGEND_SHADING_ICON = 'square';
export const LEGEND_RADIUS_ICON = 'radius';
export const HIDDEN_ICON = 'hidden';

function toLeaflet(icon, color, scale, direction) {
  const {
    Component,
    iconAnchor = [0.5 * ICON_BASE_SIZE, 0.5 * ICON_BASE_SIZE], // default to center point
    popupAnchor = [1, -3], // default tuned by hand
    ...params
  } = icon;
  const scaledIconSize = ICON_BASE_SIZE * scale;
  const scaledIconAnchor = [iconAnchor[0] * scale, iconAnchor[1] * scale];
  const scaledPopupAnchor = [popupAnchor[0] * scale, popupAnchor[1] * scale];

  return L.divIcon({
    iconSize: [scaledIconSize, scaledIconSize],
    iconAnchor: scaledIconAnchor,
    popupAnchor: scaledPopupAnchor,
    className: 'tupaia-simple',
    ...params,
    html: ReactDOMServer.renderToStaticMarkup(
      <Component color={color} scale={scale} direction={direction} />,
    ),
  });
}

// Returns jsx version of marker (for Legend rendering)
export function getMarkerForOption(iconKey, colorName, stroke) {
  const icon = icons[iconKey] || icons.pin;
  const color = BREWER_PALETTE[colorName] || colorName;
  return <icon.Component color={color} stroke={stroke} />;
}

// Return html version of marker (for Map rendering)
export function getMarkerForValue(iconKey, colorName, scale = 1, direction) {
  const icon = icons[iconKey] || icons.pin;
  const color = BREWER_PALETTE[colorName] || colorName;
  return toLeaflet(icon, color, scale, direction);
}

const iconPropTypes = {
  color: PropTypes.string.isRequired,
  scale: PropTypes.number,
};
const iconDefaultProps = {
  scale: 1,
};

PinIcon.propTypes = iconPropTypes;
PinIcon.defaultProps = iconDefaultProps;
ArrowIcon.propTypes = {
  scale: PropTypes.number,
  direction: PropTypes.string.isRequired,
};
ArrowIcon.defaultProps = {
  scale: 1,
};
HealthPinIcon.propTypes = iconPropTypes;
HealthPinIcon.defaultProps = iconDefaultProps;
CircleIcon.propTypes = iconPropTypes;
CircleIcon.defaultProps = iconDefaultProps;
TriangleIcon.propTypes = iconPropTypes;
TriangleIcon.defaultProps = iconDefaultProps;
SquareIcon.propTypes = iconPropTypes;
SquareIcon.defaultProps = iconDefaultProps;
PentagonIcon.propTypes = iconPropTypes;
PentagonIcon.defaultProps = iconDefaultProps;
RingIcon.propTypes = iconPropTypes;
RingIcon.defaultProps = iconDefaultProps;
XIcon.propTypes = iconPropTypes;
XIcon.defaultProps = iconDefaultProps;
DottedCircle.propTypes = iconPropTypes;
DottedCircle.defaultProps = iconDefaultProps;
FadedCircle.propTypes = iconPropTypes;
FadedCircle.defaultProps = iconDefaultProps;
