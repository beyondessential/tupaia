import { connect } from 'react-redux';
import { EDITOR_DATA_EDIT_BEGIN, EDITOR_DATA_EDIT_SUCCESS, EDITOR_ERROR } from './constants';

const mapDispatchToProps = dispatch => ({
  onEditBegin: () =>
    dispatch({
      type: EDITOR_DATA_EDIT_BEGIN,
    }),
  onEditSuccess: () =>
    dispatch({
      type: EDITOR_DATA_EDIT_SUCCESS,
    }),
  onEditError: errorMessage =>
    dispatch({
      type: EDITOR_ERROR,
      errorMessage,
    }),
});

export const DataChangeAction = connect(
  null,
  mapDispatchToProps,
)(({ render, ...props }) => {
  return render(props);
});
