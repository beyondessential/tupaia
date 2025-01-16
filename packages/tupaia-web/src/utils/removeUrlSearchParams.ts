export const removeUrlSearchParams = (searchParamsToRemove?: string[]) => {
  const urlSearchParams = new URLSearchParams(window.location.search); // need to access the params directly from the location object, because useSearchParams from react-router-dom doesn't work when called outside of a component
  if (searchParamsToRemove) {
    searchParamsToRemove.forEach(param => {
      urlSearchParams.delete(param);
    });
  }
  return urlSearchParams.toString();
};
