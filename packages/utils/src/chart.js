export const CHART_TYPES = {
  AREA: 'area',
  BAR: 'bar',
  COMPOSED: 'composed',
  LINE: 'line',
  PIE: 'pie',
  GAUGE: 'gauge',
};

export const getIsChartData = ({ chartType, data }) => {
  // If all segments of a pie chart are "0", display the no data message
  if (chartType === CHART_TYPES.PIE && data && data.every(segment => segment.value === 0)) {
    return false;
  }

  return data && data.length > 0;
};

export const getNoDataString = ({ noDataMessage, source, startDate, endDate }) => {
  if (noDataMessage) {
    return noDataMessage;
  }

  if (source === 'mSupply') {
    return 'Requires mSupply';
  }

  if (startDate && endDate) {
    return `No data for ${startDate} to ${endDate}`;
  }

  return 'No data for selected dates';
};
