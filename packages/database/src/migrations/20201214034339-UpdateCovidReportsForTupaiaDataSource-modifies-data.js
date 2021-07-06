'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const entityAggregation = entityType =>
  `{"entityAggregation": {"dataSourceEntityType": "${entityType}"}}`;

exports.up = async function (db) {
  await db.runSql(`
    update legacy_report 
    set data_builder_config = data_builder_config || '${entityAggregation('district')}' 
    where code IN ('COVID_Total_Cases_By_State', 'COVID_AU_Total_Cases_Each_State_Per_Day', 
                  'COVID_New_Cases_By_State', 'COVID_New_Cases_By_Day', 'COVID_Tests_Per_Capita');
  `);

  await db.runSql(`
    update legacy_report 
    set data_builder_config = jsonb_set(data_builder_config, '{dataBuilders, cases, dataBuilderConfig}', data_builder_config->'dataBuilders'->'cases'->'dataBuilderConfig' || '${entityAggregation(
      'district',
    )}', true)
    where code IN ('COVID_Compose_Daily_Deaths_Vs_Cases');
  
    update legacy_report 
    set data_builder_config = jsonb_set(data_builder_config, '{dataBuilders, deaths, dataBuilderConfig}', data_builder_config->'dataBuilders'->'deaths'->'dataBuilderConfig' || '${entityAggregation(
      'district',
    )}', true)
    where code IN ('COVID_Compose_Daily_Deaths_Vs_Cases');

    update legacy_report
    set data_builder_config = jsonb_set(data_builder_config, '{dataBuilders, cases, dataBuilderConfig}', data_builder_config->'dataBuilders'->'cases'->'dataBuilderConfig' || '${entityAggregation(
      'district',
    )}', true)
    where code IN ('COVID_Compose_Cumulative_Deaths_Vs_Cases');
  
    update legacy_report 
    set data_builder_config = jsonb_set(data_builder_config, '{dataBuilders, deaths, dataBuilderConfig}', data_builder_config->'dataBuilders'->'deaths'->'dataBuilderConfig' || '${entityAggregation(
      'district',
    )}', true)
    where code IN ('COVID_Compose_Cumulative_Deaths_Vs_Cases');

    update "mapOverlay" 
    set "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{measureBuilders, numerator, measureBuilderConfig}', "measureBuilderConfig"->'measureBuilders'->'numerator'->'measureBuilderConfig' || '${entityAggregation(
      'district',
    )}', true)
    where "id" IN ('AU_FLUTRACKING_Participants_Per_100k',
      'AU_FLUTRACKING_Sought_Medical_Advice', 
      'AU_FLUTRACKING_Tested_For_Flu',
      'AU_FLUTRACKING_Tested_For_Covid', 
      'AU_FLUTRACKING_Vaccination_Rate_Flu', 
      'AU_FLUTRACKING_Vaccinated_With_Fever_And_Cough',
      'AU_FLUTRACKING_Fever_And_Cough_Causing_Absence', 
      'AU_FLUTRACKING_Tested_Positive_For_Flu',
      'AU_FLUTRACKING_Tested_Positive_For_Covid',
      'AU_FLUTRACKING_Fever_And_Cough');
   
    update "mapOverlay" 
    set "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{measureBuilders, denominator, measureBuilderConfig}', "measureBuilderConfig"->'measureBuilders'->'denominator'->'measureBuilderConfig' || '${entityAggregation(
      'district',
    )}', true)
    where "id" IN ('AU_FLUTRACKING_Participants_Per_100k',
      'AU_FLUTRACKING_Sought_Medical_Advice', 
      'AU_FLUTRACKING_Tested_For_Flu',
      'AU_FLUTRACKING_Tested_For_Covid', 
      'AU_FLUTRACKING_Vaccination_Rate_Flu', 
      'AU_FLUTRACKING_Vaccinated_With_Fever_And_Cough',
      'AU_FLUTRACKING_Fever_And_Cough_Causing_Absence', 
      'AU_FLUTRACKING_Tested_Positive_For_Flu',
      'AU_FLUTRACKING_Tested_Positive_For_Covid',
      'AU_FLUTRACKING_Fever_And_Cough');

      update "mapOverlay" 
      set "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{measureBuilders, numerator, measureBuilderConfig}', "measureBuilderConfig"->'measureBuilders'->'numerator'->'measureBuilderConfig' || '${entityAggregation(
        'sub_district',
      )}', true)
      where "id" IN ('AU_FLUTRACKING_LGA_Sought_Medical_Advice',
        'AU_FLUTRACKING_LGA_Fever_And_Cough',
        'AU_FLUTRACKING_LGA_Vaccination_Rate_Flu',
        'AU_FLUTRACKING_LGA_Vaccinated_With_Fever_And_Cough',
        'AU_FLUTRACKING_LGA_Tested_For_Flu',
        'AU_FLUTRACKING_LGA_Tested_For_Covid',
        'AU_FLUTRACKING_LGA_Tested_Positive_For_Flu',
        'AU_FLUTRACKING_LGA_Tested_Positive_For_Covid',
        'AU_FLUTRACKING_LGA_Fever_And_Cough_Causing_Absence');
     
      update "mapOverlay" 
      set "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{measureBuilders, denominator, measureBuilderConfig}', "measureBuilderConfig"->'measureBuilders'->'denominator'->'measureBuilderConfig' || '${entityAggregation(
        'sub_district',
      )}', true)
      where "id" IN ('AU_FLUTRACKING_LGA_Sought_Medical_Advice',
      'AU_FLUTRACKING_LGA_Fever_And_Cough',
      'AU_FLUTRACKING_LGA_Vaccination_Rate_Flu',
      'AU_FLUTRACKING_LGA_Vaccinated_With_Fever_And_Cough',
      'AU_FLUTRACKING_LGA_Tested_For_Flu',
      'AU_FLUTRACKING_LGA_Tested_For_Covid',
      'AU_FLUTRACKING_LGA_Tested_Positive_For_Flu',
      'AU_FLUTRACKING_LGA_Tested_Positive_For_Covid',
      'AU_FLUTRACKING_LGA_Fever_And_Cough_Causing_Absence'); 
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
