import { useParams, useSearchParams } from 'react-router-dom';
import { URL_SEARCH_PARAMS } from '../../../constants';
import { useDashboards, useReport } from '../../../api/queries';
import { useDateRanges } from '../../../utils';
import { DashboardItem } from '../../../types';
import { useDashboardContext } from '../../Dashboard';

/**
 * This is a utility hook for returning any useful data for enlarged dashboard items
 */
export const useEnlargedDashboardItem = () => {
  const { projectCode, entityCode } = useParams();

  const [urlSearchParams] = useSearchParams();
  const reportCode = urlSearchParams.get(URL_SEARCH_PARAMS.REPORT) as DashboardItem['code'];

  const { isLoading: isLoadingDashboards } = useDashboards(projectCode, entityCode);
  const { activeDashboard } = useDashboardContext();

  const currentDashboardItem = activeDashboard?.items.find(
    dashboardItem => dashboardItem.reportCode === reportCode,
  ) as DashboardItem;

  const { startDate, endDate } = useDateRanges(
    URL_SEARCH_PARAMS.REPORT_PERIOD,
    currentDashboardItem?.config,
  );

  const { config } = currentDashboardItem || {};

  // If the report is a drilldown, it will have a drilldown id in the url
  const drilldownId = urlSearchParams.get(URL_SEARCH_PARAMS.REPORT_DRILLDOWN_ID);
  // At this time we only support drilldown in matrix visuals
  const isDrillDown = config?.type === 'matrix' && !!drilldownId;
  // If the report is a drilldown, we want to get the parent dashboard item, so that we can get the parameter link for querying the data, and also so that we can show a back button to the correct parent dashboard item

  const parentDashboardItem = isDrillDown
    ? (activeDashboard?.items.find(
        // @ts-ignore - drillDown is all lowercase in the types config
        dashboardItem => dashboardItem?.config?.drillDown?.itemCode === reportCode,
      ) as DashboardItem)
    : null;

  // Get the parameters for the report
  const getParameters = () => {
    const params = {
      projectCode,
      entityCode,
      dashboardCode: activeDashboard?.code,
      legacy: currentDashboardItem?.legacy,
      itemCode: currentDashboardItem?.code,
    } as Record<string, any>;

    if (currentDashboardItem?.config?.periodGranularity) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    if (!isDrillDown) return params;
    // If the report is a drilldown, we want to add the drilldown id to the params, so that correct data is fetched
    // @ts-ignore - drillDown is all lowercase in the types config
    const { parameterLink } = parentDashboardItem?.config?.drillDown;
    return {
      ...params,
      [parameterLink]: drilldownId,
    };
  };

  const params = getParameters();

  const {
    data: reportData,
    isLoading: isLoadingReportData,
    error,
    refetch,
    isFetching,
  } = useReport(reportCode, params);

  return {
    activeDashboard,
    reportCode,
    currentDashboardItem,
    isLoadingDashboards,
    reportData,
    isLoadingReportData: isLoadingReportData || isFetching,
    reportError: error,
    refetchReportData: refetch,
    parentDashboardItem,
    isDrillDown,
    drilldownId,
  };
};
