import { PERIOD_TYPE_CONFIG } from './period';

const DATE_OFFSET_MODIFIERS = {
  START_OF: 'start_of',
  END_OF: 'end_of',
};

export const addMomentOffset = (moment, dateOffset) => {
  const mutatingMoment = moment.clone();
  const { unit: unitInput = '', offset, modifier, modifierUnit = null } = dateOffset;
  const unit = unitInput.toUpperCase();

  // We need a valid unit to proceed.
  if (!PERIOD_TYPE_CONFIG[unit]) {
    return mutatingMoment;
  }

  const { momentUnit } = PERIOD_TYPE_CONFIG[unit];

  if (offset) {
    mutatingMoment.add(offset, momentUnit);
  }

  // If modifier is set (eg: 'start_of', 'end_of'),
  // switch the default date to either start or end of the modifer unit
  if (modifier) {
    switch (modifier) {
      case DATE_OFFSET_MODIFIERS.START_OF:
        mutatingMoment.startOf(modifierUnit || momentUnit);
        break;
      case DATE_OFFSET_MODIFIERS.END_OF:
        mutatingMoment.endOf(modifierUnit || momentUnit);
        break;
      default:
    }
  }

  return mutatingMoment;
};
