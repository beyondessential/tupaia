/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DashboardType } from '../../types';
// import { get } from '../api';

const exploreData = [
  {
    id: 'test',
    code: 'explore_General',
    name: 'General',
    rootEntityCode: 'explore',
    sortOrder: null,
    items: [
      {
        code: '28',
        legacy: true,
        reportCode: '28',
        name: 'Number of Operational Facilities Surveyed by Country',
        type: 'chart',
        chartType: 'pie',
        valueType: 'text',
        isFavourite: null,
        rootEntityCode: 'DL',
        id: '28',
        viewType: '',
        periodGranularity: null,
      },
      {
        code: '8',
        legacy: true,
        reportCode: '8',
        name: 'Number of Healthcare Workers',
        type: 'chart',
        chartType: 'pie',
        valueType: 'text',
        defaultTimePeriod: {
          start: {
            unit: 'year',
            offset: -1,
          },
        },
      },
    ],
  },
];

const fanafanaOla = [
  {
    name: 'Reproductive Health Indicators',
    id: 'test3',
    code: 'to_reproductive_health_indicators',
    rootEntityCode: 'TO',
    items: [
      {
        code: 'rh_to_bar_adolescent_birth_rate_per_1000_women_ages_15_19_years',
        legacy: false,
        reportCode: 'rh_to_bar_adolescent_birth_rate_per_1000_women_ages_15_19_years',
        name: 'Adolescent birth rate (per 1000 women ages 15-19 years)',
        type: 'chart',
        yName: 'Adolescent Birth Rate',
        chartType: 'line',
        reference: {
          link:
            'https://www.who.int/data/gho/data/indicators/indicator-details/GHO/adolescent-birth-rate-(per-1000-women-aged-15-19-years)',
          name: 'WHO',
        },
        chartConfig: {
          value: {
            color: '#47A2DA',
            label: 'Adolescent Birth Rate',
          },
        },
        defaultTimePeriod: {
          start: {
            unit: 'year',
            offset: -3,
          },
        },
        periodGranularity: 'year',
        isFavourite: false,
      },
      {
        code: 'rh_to_line_antenatal_care_coverage',
        legacy: false,
        reportCode: 'rh_to_line_antenatal_care_coverage',
        name: 'Antenatal Care Coverage',
        type: 'chart',
        chartType: 'line',
        reference: {
          link: 'https://www.who.int/data/gho/indicator-metadata-registry/imr-details/80',
          name: 'WHO',
        },
        valueType: 'percentage',
        periodGranularity: 'month',
        presentationOptions: {
          hideAverage: true,
        },
        isFavourite: false,
      },
      {
        code: 'rh_to_line_births_attended_skilled_health_personnel',
        legacy: false,
        reportCode: 'rh_to_line_births_attended_skilled_health_personnel',
        name: 'Births attended by skilled health personnel',
        type: 'chart',
        chartType: 'line',
        reference: {
          link:
            'https://www.who.int/data/gho/data/indicators/indicator-details/GHO/births-attended-by-skilled-health-personnel-(-)',
          name: 'WHO',
        },
        valueType: 'percentage',
        description:
          'Note the following are considered skilled health personnel: Doctor, Midwife or Nurse',
        periodGranularity: 'month',
        isFavourite: false,
      },
      {
        code: 'rh_to_n_comp_births_delivered_by_cesarean_delivery',
        legacy: false,
        reportCode: 'rh_to_n_comp_births_delivered_by_cesarean_delivery',
        name: 'Births delivered by cesarean delivery',
        type: 'chart',
        chartType: 'composed',
        reference: {
          link:
            'https://www.measureevaluation.org/rbf/indicator-collections/health-outcome-impact-indicators/cesarean-sections-as-a-percent-of-all-births.html',
          name: 'WHO',
        },
        chartConfig: {
          'Number of Cesarean Deliveries': {
            color: '#B744B8',
            label: 'Number of Cesarean Deliveries',
            yName: 'Number of Cesarean Deliveries',
            stackId: '1',
            chartType: 'bar',
            legendOrder: '1',
          },
          '% of Births Delivered by Cesarean Delivery': {
            color: '#47A2DA',
            yName: '% of Births Delivered by Cesarean Delivery',
            chartType: 'line',
            valueType: 'percentage',
            legendOrder: '2',
            yAxisOrientation: 'right',
          },
        },
        periodGranularity: 'month',
        isFavourite: false,
      },
      {
        code: 'rh_to_n_bar_maternal_mortality_number',
        legacy: false,
        reportCode: 'rh_to_n_bar_maternal_mortality_number',
        name: 'Maternal Mortality Number',
        type: 'chart',
        chartType: 'bar',
        chartConfig: {
          value: {
            color: '#B744B8',
            label: 'Total maternal deaths',
          },
        },
        description: 'Total maternal deaths',
        periodGranularity: 'year',
        presentationOptions: {
          hideAverage: true,
        },
        isFavourite: false,
      },
      {
        code: 'rh_to_composed_number_and_prevalence_of_anaemic_pregnancies ',
        legacy: false,
        reportCode: 'rh_to_composed_number_and_prevalence_of_anaemic_pregnancies ',
        name: 'Number and Prevalence of Anaemic Pregnancies ',
        type: 'chart',
        chartType: 'composed',
        chartConfig: {
          aneamic: {
            color: '#FFB400',
            label: 'Anaemic Pregnancies',
            yName: 'Total Deliveries',
            stackId: '1',
            chartType: 'bar',
            legendOrder: '1',
          },
          nonaneamic: {
            color: '#B744B8',
            label: 'Non Anaemic Pregnancies',
            yName: 'Total Deliveries',
            stackId: '1',
            chartType: 'bar',
            legendOrder: '1',
          },
          anaemic_pregnancy_prevalence_rate: {
            color: '#47A2DA',
            label: 'Anaemic Pregnancy Prevalence rate',
            yName: 'Anaemic Pregnancy Prevalence rate',
            chartType: 'line',
            valueType: 'percentage',
            legendOrder: '3',
            yAxisOrientation: 'right',
          },
        },
        periodGranularity: 'month',
        isFavourite: false,
      },
      {
        code: 'rh_to_number_of_still_births',
        legacy: false,
        reportCode: 'rh_to_number_of_still_births',
        name: 'Number of still births',
        type: 'chart',
        xName: 'Year',
        yName: 'Number of Still Birth',
        chartType: 'bar',
        valueType: 'number',
        chartConfig: {
          value: {
            color: '#B744B8',
            label: 'Still Birth',
          },
        },
        periodGranularity: 'year',
        presentationOptions: {
          hideAverage: true,
        },
        isFavourite: false,
      },
      {
        code: 'rh_to_line_low_birth_weight_among_newborns',
        legacy: false,
        reportCode: 'rh_to_line_low_birth_weight_among_newborns',
        name: 'Low Birth Weight Among Newborns',
        type: 'chart',
        chartType: 'line',
        valueType: 'percentage',
        description: '% of live births weighing less than 2500g',
        periodGranularity: 'month',
        presentationOptions: {
          hideAverage: true,
        },
        isFavourite: false,
      },
    ],
  },
];

export const useDashboards = (projectCode?: string, entityCode?: string) => {
  return useQuery(
    ['dashboards', projectCode, entityCode],
    () => {
      // @ts-ignore - just for testData
      let testData = [];
      if (projectCode === 'explore') testData = exploreData;
      else if (projectCode === 'fanafana') testData = fanafanaOla;
      // @ts-ignore - just for testData
      return Promise.resolve(() => testData as DashboardType[]); // TODO: replace this with actual data fetching
    },
    // get('dashboards', {
    //   params: { entityCode, projectCode },
    // }),
    { enabled: !!entityCode && !!projectCode },
  );
};
