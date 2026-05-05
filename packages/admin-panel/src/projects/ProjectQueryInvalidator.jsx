import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { selectSelectedProjectCode } from './selectors';

const ProjectQueryInvalidatorComponent = ({ projectCode }) => {
  const queryClient = useQueryClient();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    queryClient.invalidateQueries();
  }, [projectCode, queryClient]);

  return null;
};

ProjectQueryInvalidatorComponent.propTypes = {
  projectCode: PropTypes.string,
};

ProjectQueryInvalidatorComponent.defaultProps = {
  projectCode: null,
};

const mapStateToProps = state => ({
  projectCode: selectSelectedProjectCode(state),
});

export const ProjectQueryInvalidator = connect(mapStateToProps)(ProjectQueryInvalidatorComponent);
