import { useEffect, useState } from 'react';

const scrollToValidationError = () => {
  const firstError = document.querySelector('.Mui-error');
  if (!firstError) return;
  firstError.focus();
  firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

export const useValidationScroll = (onSave, onEdit, validationErrors) => {
  const [hasTouched, setHasTouched] = useState(false);

  const onEditWithTouched = (fieldKey, newValue) => {
    onEdit(fieldKey, newValue);
    setHasTouched(true);
  };

  const onSaveWithTouched = () => {
    onSave();
    setHasTouched(false);
  };

  useEffect(() => {
    if (hasTouched) return;
    scrollToValidationError();
  }, [validationErrors, hasTouched]);

  return {
    hasTouched,
    onEditWithTouched,
    onSaveWithTouched,
  };
};
