import { connect } from 'react-redux';
import { CountryList } from './CountryList';
import { selectCountry, loadCountriesFromDatabase } from './actions';
import { navigateToRequestCountryAccess } from '../navigation/actions';

const mapStateToProps = ({ country }) => {
  const { selectedCountryId, isCountryMenuVisible, availableCountries, unavailableCountries } =
    country;

  return {
    selectedCountryId,
    isCountryMenuVisible,
    availableCountries,
    unavailableCountries,
  };
};

const mapDispatchToProps = dispatch => ({
  onMount: () => dispatch(loadCountriesFromDatabase()),
  onChangeCountry: (countryId, countryName) => dispatch(selectCountry(countryId, countryName)),
  onRequestCountryAccess: () => dispatch(navigateToRequestCountryAccess()),
});

export const CountryListContainer = connect(mapStateToProps, mapDispatchToProps)(CountryList);
