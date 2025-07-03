/* eslint-disable react/prop-types */

import L from 'leaflet';
import React, { ElementType } from 'react';
import ReactDOMServer from 'react-dom/server';
import Warning from '@material-ui/icons/Warning';
import Help from '@material-ui/icons/Help';
import CheckBox from '@material-ui/icons/CheckBox';
// Additional Material UI icons for dynamic usage
// Note: Add more icons here as needed for your map overlays
// For now, we'll add them as they're needed to avoid import errors
import { PointExpression } from 'leaflet';
import { CssColor, IconKey, IconKeyOrString } from '@tupaia/types';
import { BREWER_PALETTE, WHITE } from '../../constants';
import { Color, ColorKey } from '../../types';
import { ICON_BASE_SIZE } from './constants';
import { IconContainer } from './IconContainer';
// from https://thenounproject.com/ochavisual/collection/ocha-humanitarian-icons/
import { UpArrow, DownArrow, RightArrow } from './arrowIcons';

// allows passing a color to a material icon & scales it down a bit
const wrapMaterialIcon =
  (Base: ElementType) =>
  ({ color }: { color?: Color }) =>
    <Base htmlColor={color} viewBox="-3 -3 29 29" />;

// Map of Material UI icon names to their components
const materialIcons: { [key: string]: ElementType } = {
  // Animals
  'Pets': Pets,
  
  // Places and locations
  'Home': Home,
  'School': School,
  'LocalHospital': LocalHospital,
  'Restaurant': Restaurant,
  'ShoppingCart': ShoppingCart,
  'Work': Work,
  'Business': Business,
  'LocalGroceryStore': LocalGroceryStore,
  
  // Transportation
  'DirectionsCar': DirectionsCar,
  'Flight': Flight,
  'Train': Train,
  
  // General
  'Star': Star,
  'Favorite': Favorite,
  'LocationOn': LocationOn,
  'Phone': Phone,
  'Email': Email,
  'Person': Person,
  'Group': Group,
  'Event': Event,
};

// Get a Material UI icon component by name
const getMaterialIcon = (iconName: string): ElementType | null => {
  const IconComponent = materialIcons[iconName];
  if (IconComponent) {
    return wrapMaterialIcon(IconComponent);
  }
  return null;
};

interface ScaleIconProps {
  scale?: number;
}

interface IconProps extends ScaleIconProps {
  color?: Color;
}

const PinIcon = ({ color, scale = 1 }: IconProps) => {
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

const UpArrowIcon = ({ scale = 1 }: ScaleIconProps) => {
  return UpArrow(scale);
};

const RightArrowIcon = ({ scale = 1 }: ScaleIconProps) => {
  return RightArrow(scale);
};

const DownArrowIcon = ({ scale = 1 }: ScaleIconProps) => {
  return DownArrow(scale);
};

const HealthPinIcon = ({ color, scale = 1 }: IconProps) => (
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

const CircleIcon = ({ color, scale = 1 }: IconProps) => (
  <IconContainer scale={scale}>
    <circle cx="500" cy="500" r="400" stroke={WHITE} strokeWidth="80" fill={color} />
  </IconContainer>
);

const RadiusIcon = ({ color, scale = 1 }: IconProps) => (
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

const DottedCircle = ({ color, scale = 1 }: IconProps) => (
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

const SquareIcon = ({
  color,
  scale = 1,
  stroke = color,
}: IconProps & {
  stroke?: string;
}) => (
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

const RingIcon = ({ color, scale = 1 }: IconProps) => (
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
function makePolygon(numberOfPoints: number, radius: number): string {
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
const PentagonIcon = ({ color, scale = 1 }: IconProps) => (
  <IconContainer viewBox="-4 -4 8 8" scale={scale}>
    <path d={pentagonPath} fill={color} stroke={WHITE} strokeWidth="0.4" />
  </IconContainer>
);

const trianglePath = makePolygon(3, 3);
const TriangleIcon = ({ color, scale = 1 }: IconProps) => (
  <IconContainer viewBox="-4 -4 8 8" scale={scale}>
    <path d={trianglePath} fill={color} stroke={WHITE} strokeWidth="0.4" />
  </IconContainer>
);

const XIcon = ({ color, scale = 1 }: IconProps) => (
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

const HIcon = ({
  color,
  h = 0.24,
  v = 0.2,
  scale = 1,
}: IconProps & {
  h?: number;
  v?: number;
}) => (
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

const FadedCircle = ({ color, scale = 1 }: IconProps) => {
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
  [IconKey.PIN]: {
    Component: PinIcon,
    iconAnchor: [10, 24],
    popupAnchor: [0, -30],
  },
  [IconKey.UP_ARROW]: {
    Component: UpArrowIcon,
    iconAnchor: [10, 24],
    popupAnchor: [0, -30],
  },
  [IconKey.RIGHT_ARROW]: {
    Component: RightArrowIcon,
    iconAnchor: [10, 24],
    popupAnchor: [0, -30],
  },
  [IconKey.DOWN_ARROW]: {
    Component: DownArrowIcon,
    iconAnchor: [10, 24],
    popupAnchor: [0, -30],
  },
  [IconKey.HEALTH_PIN]: {
    Component: HealthPinIcon,
    iconAnchor: [12, 24],
    popupAnchor: [0, -30],
  },
  [IconKey.CIRCLE]: {
    Component: CircleIcon,
  },
  [IconKey.SQUARE]: {
    Component: SquareIcon,
  },
  [IconKey.TRIANGLE]: {
    Component: TriangleIcon,
  },
  [IconKey.PENTAGON]: {
    Component: PentagonIcon,
  },
  [IconKey.RADIUS]: {
    Component: RadiusIcon,
  },
  [IconKey.RING]: {
    Component: RingIcon,
  },
  [IconKey.H]: {
    Component: HIcon,
  },
  [IconKey.X]: {
    Component: XIcon,
  },
  [IconKey.EMPTY]: {
    Component: DottedCircle,
  },
  [IconKey.FADE]: {
    Component: FadedCircle,
  },
  [IconKey.WARNING]: {
    Component: wrapMaterialIcon(Warning),
  },
  [IconKey.HELP]: {
    Component: wrapMaterialIcon(Help),
  },
  [IconKey.CHECKBOX]: {
    Component: wrapMaterialIcon(CheckBox),
  },
  [IconKey.HIDDEN]: {
    Component: () => null,
  },
};

type IconType = {
  Component: ElementType;
  iconAnchor?: number[];
  popupAnchor?: number[];
  [key: string]: unknown;
};

export const SPECTRUM_ICON = IconKey.FADE;
export const UNKNOWN_ICON = IconKey.EMPTY;
export const DEFAULT_ICON = IconKey.HEALTH_PIN;
export const LEGEND_COLOR_ICON = IconKey.CIRCLE;
export const LEGEND_SHADING_ICON = IconKey.SQUARE;
export const LEGEND_RADIUS_ICON = IconKey.RADIUS;
export const HIDDEN_ICON = IconKey.HIDDEN;

function toLeaflet(icon: IconType, color?: string, scale = 1): L.DivIcon {
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
    iconAnchor: scaledIconAnchor as PointExpression,
    popupAnchor: scaledPopupAnchor as PointExpression,
    className: 'tupaia-simple',
    ...params,
    html: ReactDOMServer.renderToStaticMarkup(<Component color={color} scale={scale} />),
  });
}

// Helper function to get icon configuration
const getIconConfig = (iconKey: string): IconType => {
  // Check if it's a predefined icon first
  const predefinedIcon = icons[iconKey as IconKey];
  if (predefinedIcon) {
    return predefinedIcon;
  }

  // Try to get a Material UI icon
  const materialIcon = getMaterialIcon(iconKey);
  if (materialIcon) {
    return {
      Component: materialIcon,
      // Default Material UI icon configuration
      iconAnchor: [12, 12], // center for square icons
      popupAnchor: [0, -15],
    };
  }

  // Fallback to default icon
  console.warn(`Icon "${iconKey}" not found, falling back to default icon`);
  return icons[DEFAULT_ICON];
};

// Returns jsx version of marker (for Legend rendering)
export function getMarkerForOption(
  iconKey: IconKey | string | undefined,
  colorName?: Color,
  stroke?: CssColor,
) {
  if (!iconKey) {
    iconKey = DEFAULT_ICON;
  }
  
  const iconConfig = getIconConfig(iconKey);
  const color = BREWER_PALETTE[colorName as ColorKey] || colorName;
  return <iconConfig.Component color={color} stroke={stroke} />;
}

// Return html version of marker (for Map rendering)
export function getMarkerForValue(iconKey: IconKey | string | undefined, colorName?: Color, scale = 1) {
  if (!iconKey) {
    iconKey = DEFAULT_ICON;
  }
  
  const iconConfig = getIconConfig(iconKey);
  const color = BREWER_PALETTE[colorName as ColorKey] || colorName;
  return toLeaflet(iconConfig, color, scale);
}
