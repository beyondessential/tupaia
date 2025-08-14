import { css } from 'styled-components';

export const LeafletStyles = css`
  /* Overrides for Leaflet styles. */
  .leaflet-container {
    background: black; /* Remove the grey tile background of not yet loaded tiles */
  }
  .leaflet-popup-tip,
  .leaflet-popup-content-wrapper,
  .leaflet-tooltip {
    color: white;
    background: rgb(43, 45, 56);
    border: 1px solid #555;
  }
  .leaflet-popup-content-wrapper {
    border-radius: 8px;
  }
  .leaflet-popup-tip-container {
    margin-top: -1px;
  }
  .leaflet-popup-tip {
  }
  /* Tooltip bordered arrow */
  .leaflet-tooltip-top:after,
  .leaflet-tooltip-bottom:after,
  .leaflet-tooltip-left:after,
  .leaflet-tooltip-right:after {
    position: absolute;
    pointer-events: none;
    border: 6px solid transparent;
    background: transparent;
    content: '';
    z-index: 5;
  }
  .leaflet-tooltip-left:after,
  .leaflet-tooltip-right:after {
    top: 50%;
    margin-top: -6px;
  }
  .leaflet-tooltip-right:after {
    left: 0;
    margin-left: -10px;
    border-right-color: rgb(43, 45, 56);
  }
  .leaflet-tooltip-left:after {
    right: 0;
    margin-right: -10px;
    border-left-color: rgb(43, 45, 56);
  }
  .leaflet-tooltip-left:before {
    border-left-color: #555;
  }
  .leaflet-tooltip-right:before {
    border-right-color: #555;
  }
  .leaflet-bottom.leaflet-right .leaflet-control-attribution {
    // Leaflet attribution is manually added in the TileLayer along side
    // the mapbox attribution to keep all the attributions in one place
    display: none;
  }
  .leaflet-control.leaflet-control-attribution {
    background: none;
  }
`;
