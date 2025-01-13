import { useParams } from 'react-router';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useProject } from '../../../api/queries';
import { EntityCode } from '../../../types';
import { DEFAULT_PERIOD_PARAM_STRING, URL_SEARCH_PARAMS } from '../../../constants';

export const useNavigateToEntity = () => {
  const { projectCode } = useParams();
  const [urlSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: project } = useProject(projectCode);

  const dashboardNameParam = project?.dashboardGroupName
    ? encodeURIComponent(project.dashboardGroupName)
    : '';

  // only set the default period param if it is not already set. This is so that if it is already set, changing the entity won't reset the period if they've already changed it
  if (!urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD)) {
    urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD, DEFAULT_PERIOD_PARAM_STRING);
  }

  return (entityCode?: EntityCode) => {
    const link = {
      ...location,
      search: urlSearchParams.toString(),
      pathname: `/${projectCode}/${entityCode}/${dashboardNameParam}`,
    };
    navigate(link);
  };
};
