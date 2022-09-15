import { TupaiaDatabase } from '@tupaia/database';
import { string } from 'mathjs';
import KEYS from './data/tongaCovidRawDataFaster.json';

export const tongaCovidRawDataFaster = async () => {
  const db = new TupaiaDatabase();
  const rows: Record<string, string | number>[] = await db.executeSql(
    `
    select
        C19.lab_id as "Test ID",
        C19.surname as "Surname",
        C19.first_name as "Given Names",
        C19.dob as "Date of Birth",
        C19.age as "Age",
        C19.sex as "Sex",
        C19.phone as "Phone No.",
        C19.island as "Island Group",
        C19.village_code as "Village Code",
        C19.village as "Address",
        C19.date_specimen_collected as "Date of Test",
        C19.results as "Result",
        C19.new_case as "New Case",
        (case 
            when C19.results = 'Positive' and C19.symptomatic = 'Yes' and C19.date_symptom_onset is not null then (C19.date_symptom_onset::date + interval '13' day)::date
            when C19.results = 'Positive' and C19.symptomatic = 'Yes' and C19.date_symptom_onset is null then (C19.date_specimen_collected + interval '13' day)::date 
            when C19.results = 'Positive' then (C19.date_specimen_collected + interval '10' day)::date
            end) as "Estimated Recovery Date",
        C19.test_type as "Test Type",
        C19.ctvalue as "CT Value",
        C19.vax_status as "Vaccination Status",
        C19.outbound_traveller as "Outbound Traveller",
        C19.inbound_traveller as "Inbound Traveller",
        C19.symptomatic as "Symptomatic",
        C19.date_symptom_onset as "Date of Symptomatic Onset",
        C19.quarantine as "Quarantine",
        C19.linkedtocase as "Primary Contact",
        C19.frontliner as "Frontliner",
        C19.frontliner_type as "Frontliner Type",
        C19.other_frontliner_type as "Other",
        C19.communitytesting as "Community Testing",
        C19.patient as "Patient",
        C19.other_reason as "Other Reason",
        C19.primarycontact_testingday as "Primary Contact Testing Day",
        C19.specimen_site as "Testing Site",
        C19.quarantine_facility as "Quarantine Facility",
        C19.ward_type as "Ward Type",
        C19.clinic_type as "Clinic Type",
        hc.name as "Health Center",
        C19.rrt_team as "RRT Team Name",
        C19.other_site as "Other"
    from
    (
        select
            e.code as lab_id,
            reg.date as date_registered,
            reg.surname,
            reg.first_name,
            reg.dob,
            date_part('year', age(sr.data_time::date, reg.dob::date)) as age,
            reg.sex,
            reg.phone,
            ggp.name as island,
            p.code as village_code,
            p.name as village,
            sr.data_time as date_specimen_collected,
            max(case when q.code = 'C19T012' then a.text end) as test_type,
            max(case when q.code = 'C19T013' then a.text end) as other_type,
            max(case when q.code = 'C19T013_a' then a.text end) as ctvalue,
            max(case when q.code = 'C19T015' then a.text end) as outbound_traveller,
            max(case when q.code = 'C19T015_a' then a.text end) as inbound_traveller,
            max(case when q.code = 'C19T016' then a.text end) as symptomatic,
            max(case when q.code = 'C19T042' then a.text end) as date_symptom_onset,
            max(case when q.code = 'C19T017' then a.text end) as quarantine,
            max(case when q.code = 'C19T018' then a.text end) as linkedtocase,
            max(case when q.code = 'C19T019' then a.text end) as frontliner,
            max(case when q.code = 'C19T021' then a.text end) as frontliner_type,
            max(case when q.code = 'C19T022' then a.text end) as other_frontliner_type,
            max(case when q.code = 'C19T020' then a.text end) as communitytesting,
            max(case when q.code = 'C19T038' then a.text end) as patient,
            max(case when q.code = 'C19T039' then a.text end) as other_reason,
            max(case when q.code = 'C19T044' then a.text end) as primarycontact_testingday,
            max(case when q.code = 'C19T024' then a.text end) as specimen_site,
            max(case when q.code = 'C19T025' then a.text end) as quarantine_facility,
            max(case when q.code = 'C19T026' then a.text end) as ward_type,
            max(case when q.code = 'C19T027' then a.text end) as clinic_type,
            max(case when q.code = 'C19T028' then a.text end) as health_centre,
            max(case when q.code = 'C19T041' then a.text end) as rrt_team,
            max(case when q.code = 'C19T029' then a.text end) as other_site,
            max(case when q.code = 'C19T032' then a.text end) as rat,
            max(case when q.code = 'C19T033' then a.text end) as results,
            max(case when q.code = 'C19T034' then a.text end) as other_results,
            max(case when q.code = 'C19T035' then a.text end) as new_case,
            max(case when q.code = 'C19T036' then a.text end) as previous_positive,
            max(case when q.code = 'C19T037' then to_char(a.text::timestamp::date, 'yyyy-mm-dd') end) as date_previous_positive,
            max(case when q.code = 'C19T043' then a.text end) as vax_status
        from survey_response sr 
        join answer a on a.survey_response_id = sr.id 
        join question q on q.id = a.question_id 
        join survey s on s.id = sr.survey_id 
        join entity e on e.id = sr.entity_id
        join entity p on p.id = e.parent_id 
        join entity gp on gp.id = p.parent_id 
        join entity ggp on ggp.id = gp.parent_id 
        join
        (
            select
                e1.code as entity_code,
                sr1.data_time as date,
                max(case when q1.code = 'C19T002' then a1.text end) as surname,
                max(case when q1.code = 'C19T003' then a1.text end) as first_name,
                max(case when q1.code = 'C19T004' then to_char(a1.text::timestamp::date, 'yyyy-mm-dd') end) as dob,                 
                max(case when q1.code = 'C19T005' then a1.text end) as sex,
                max(case when q1.code = 'C19T006' then a1.text end) as phone
            from survey_response sr1 
            join answer a1 on a1.survey_response_id = sr1.id
            join question q1 on q1.id = a1.question_id 
            join survey s1 on s1.id = sr1.survey_id 
            join entity e1 on e1.id = sr1.entity_id
            where s1.code = 'C19T_Registration' and e1.country_code = 'TO'
            group by e1.code, sr1.data_time 
        ) reg on reg.entity_code = e.code
        where s.code = 'C19T_Results' and e.country_code = 'TO'
        group by sr.id, reg.date, reg.surname, reg.first_name, reg.dob, reg.sex, reg.phone, sr.data_time, e.code, p.name, p.code, ggp.name
    ) C19
    left join entity hc on hc.id = C19.health_centre
  `,
    [],
  );

  const columns: Record<string, string>[] = KEYS.map(key => {
    return { title: key, key };
  });

  return { columns, rows: rows.filter((row, index) => index < 20) };
};
