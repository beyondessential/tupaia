import {
  REWARDS_BALANCE_REQUEST,
  REWARDS_BALANCE_SUCCESS,
  REWARDS_BALANCE_FAILURE,
} from './constants';
import { formatPlural } from '../utilities';
import { addMessage, MESSAGE_TYPES } from '../messages';

export const getLatestUserRewardCount =
  () =>
  async (dispatch, getState, { api }) => {
    const { rewards } = getState();
    const { isInitialLoadComplete } = rewards;

    dispatch({ type: REWARDS_BALANCE_REQUEST });

    try {
      const { coconuts, pigs } = await api.getCurrentUserRewards();
      const pigDifference = pigs - rewards.pigs;
      const coconutDifference = coconuts - rewards.coconuts;

      if (isInitialLoadComplete) {
        emitRewardMessage(pigDifference, coconutDifference, dispatch);
      }

      dispatch({
        type: REWARDS_BALANCE_SUCCESS,
        coconuts,
        pigs,
      });
    } catch (error) {
      dispatch({
        type: REWARDS_BALANCE_FAILURE,
        errorMessage: error,
      });
    }
  };

const emitRewardMessage = (pigDifference, coconutDifference, dispatch) => {
  if (pigDifference < 1 && coconutDifference < 1) {
    return;
  }

  let message = 'You earned ';

  if (pigDifference > 0) {
    message += formatPlural('@count pig', '@count pigs', pigDifference);
    if (coconutDifference > 0) {
      message += ' and ';
    }
  }
  if (coconutDifference > 0) {
    message += formatPlural('@count coconut', '@count coconuts', coconutDifference);
  }

  message += ' for your last sync';

  dispatch(
    addMessage('reward_change', message, {
      title: 'Great work!',
      type: MESSAGE_TYPES.EXPLODE,
      svgName: pigDifference > 0 ? 'pig' : 'coconut',
    }),
  );
};
