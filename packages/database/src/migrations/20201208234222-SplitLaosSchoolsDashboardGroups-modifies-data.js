'use strict';

import { insertObject, arrayToDbString } from '../utilities';

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

const laosSchoolUser = 'Laos Schools User';
const laosSchoolSuperUser = 'Laos Schools Super User';

const newDashboardGroups = [
  {
    name: 'Students / Schools',
    codePrefix: 'LA_Students_Schools_',
    userGroup: laosSchoolUser,
    reports: {
      // National level view (Country)
      Country: [
        // Number of Students, Laos
        'Laos_Schools_Number_Of_Students_Matrix',
        // Number of Students by Gender, Laos
        'Laos_Schools_Male_Female',
      ],
      // Provincial level view (District)
      District: [
        //   Province Code, Province Population
        'Laos_Schools_Province_Details_Table_1',
        // Number of Pre-schools, Number of Primary Schools, Number of Secondary Schools
        'Laos_Schools_Number_Of_Schools_By_Type_Table',
        //   Number of Students, Province
        'Laos_Schools_Number_Of_Students_Matrix',
        //   Number of Students by Gender, Province
        'Laos_Schools_Male_Female',
        //   Drop-out Rate in Primary Education (%), Province
        'Laos_Schools_Dropout_Bar_Primary_Province',
        //   Drop-out Rate in Lower Secondary Education (%), Province
        'Laos_Schools_Dropout_Bar_Lower_Secondary_Province',
        //   Drop-out Rate in Upper Secondary Education (%), Province
        'Laos_Schools_Dropout_Bar_Upper_Secondary_Province',
        //   Repeat Rate in Primary Education (%), Province
        'Laos_Schools_Repeaters_Bar_Primary_Province',
        //   Repeat Rate in Lower Secondary Education (%), Province
        'Laos_Schools_Repeaters_Bar_Lower_Secondary_Province',
        //   Repeat Rate in Upper Secondary Education (%), Province
        'Laos_Schools_Repeaters_Bar_Upper_Secondary_Province',
      ],
      // District level view (SubDistrict)
      SubDistrict: [
        //   District Code, Population, Priority District
        'Laos_Schools_District_Details_Table_District_Info',
        //   Province, Province Code, Province Population
        'Laos_Schools_District_Details_Table_Province_Info',
        //   Number of schools
        'Laos_Schools_Number_Of_Schools_By_Type_Table',
        //   Number of Students, District
        'Laos_Schools_Number_Of_Students_Matrix',
        //   Number of Students by Gender, District
        'Laos_Schools_Male_Female',
        //   Drop-out Rate in Primary Education (%), District
        'Laos_Schools_Dropout_Bar_Primary_District',
        //   Drop-out Rate in Lower Secondary Education (%), District
        'Laos_Schools_Dropout_Bar_Lower_Secondary_District',
        //   Drop-out Rate in Upper Secondary Education (%), District
        'Laos_Schools_Dropout_Bar_Upper_Secondary_District',
        //   Repeat Rate in Primary Education (%), District
        'Laos_Schools_Repeaters_Bar_Primary_District',
        //   Repeat Rate in Lower Secondary Education (%), District
        'Laos_Schools_Repeaters_Bar_Lower_Secondary_District',
        //   Repeat Rate in Upper Secondary Education (%), District
        'Laos_Schools_Repeaters_Bar_Upper_Secondary_District',
      ],
      // School level view (School)
      School: [
        //   Name of school, Alternative name of school, School code, Province, District, District Population, Priority District, Village, Village Population,
        'Laos_Schools_School_Details_Table_1',
        //   School type, Location, Distance to main road, Telephone number, Development partner support
        'Laos_Schools_School_Details_Table_2',
        //   Number of students, school
        'Laos_Schools_Number_Of_Students_Matrix',
        //   Number of students by gender, school
        'Laos_Schools_Male_Female',
      ],
    },
  },
  {
    name: 'Textbooks and Teacher Guides',
    codePrefix: 'LA_Textbooks_Teacher_Guides_',
    userGroup: laosSchoolUser,
    reports: {
      // School level view (school)
      School: [
        //   Textbook shortage, School
        'Laos_Schools_School_Textbooks_Shortage_Primary_School',
        'Laos_Schools_School_Textbooks_Shortage_Lower_Secondary_School',
        'Laos_Schools_School_Textbooks_Shortage_Upper_Secondary_School',
        //   Textbooks Shortage by Key Subjects and Grades, School
        'Laos_Schools_School_Textbooks_Shortage_By_Key_Subjects_And_Grades_Primary_School',
        'Laos_Schools_Textbooks_Shortage_By_Key_Subjects_And_Grades_Lower_Secondary_School',
        'Laos_Schools_School_Textbooks_Shortage_By_Key_Subjects_And_Grades_Upper_Secondary_School',
      ],
    },
  },
  {
    name: 'WASH',
    codePrefix: 'LA_WASH_',
    userGroup: laosSchoolUser,
    reports: {
      // National level view (Country)
      Country: [
        //   Water, Sanitation and Hygiene (WASH), % Availability, Laos
        'Laos_Schools_WASH_Bar_Graph',
        //   Water Supply Source, % of Schools, Laos
        'Laos_Schools_Water_Supply_Source_By_School_Type',
        //   Clean Drinking Water Source, % of Schools, Laos
        'Laos_Schools_Drinking_Water_Source_By_School_Type',
      ],
      // Provincial level view (District)
      District: [
        //   Water, Sanitation and Hygiene (WASH), % Availability, Province
        'Laos_Schools_WASH_Bar_Graph',
        //   Clean Drinking Water Source, % of Schools, Province
        'Laos_Schools_Drinking_Water_Source_By_School_Type',
        //   Water Supply Source, % of Schools, Province
        'Laos_Schools_Water_Supply_Source_By_School_Type',
      ],
      // District level view (SubDistrict)
      SubDistrict: [
        //   Water, Sanitation and Hygiene (WASH), % Availability, District
        'Laos_Schools_WASH_Bar_Graph',
        //   Clean Drinking Water Source, % of Schools, District
        'Laos_Schools_Drinking_Water_Source_By_School_Type',
        //   Water Supply Source, % of Schools, District
        'Laos_Schools_Water_Supply_Source_By_School_Type',
      ],
      // School level view (school)
      School: [
        //   Water, Sanitation and Hygiene (WASH), School
        'Laos_Schools_WASH_School_Table',
      ],
    },
  },
  {
    name: 'ICT Utility Data',
    codePrefix: 'LA_ICT_Utility_Data_',
    userGroup: laosSchoolUser,
    reports: {
      // National level view (Country)
      Country: [
        //   ICT Facilities, % Availability, Laos
        'Laos_Schools_ICT_Facilities_Bar_Graph',
        //   Age of Functioning Computers, % of Schools, Laos
        'Laos_Schools_Age_Of_Computers_By_School_Type',
        //   Utility/Service Availability at Pre-Primary School Level, Laos
        'LA_Laos_Schools_Service_Availability_Percentage_Preschool',
        //   Utility/Service Availability at Primary School Level, Laos
        'LA_Laos_Schools_Service_Availability_Percentage_Primary',
        //   Utility/Service Availability at Secondary School Level, Laos
        'LA_Laos_Schools_Service_Availability_Percentage_Secondary',
        //   Schools With No Electricity - Distance to Grid, % of Schools
        'Laos_Schools_Distance_To_Grid_By_School_Type',
        //   Resources/Support Received at Pre-Primary School Level, Laos
        'LA_Laos_Schools_Resources_Percentage_Preschool',
        //   Resources/Support Received at Primary School Level, Laos
        'LA_Laos_Schools_Resources_Percentage_Primary',
        //   Resources/Support Received at Secondary School Level, Laos
        'LA_Laos_Schools_Resources_Percentage_Secondary',
      ],
      // Provincial level view (District)
      District: [
        //   ICT Facilities, % Availability, Province
        'Laos_Schools_ICT_Facilities_Bar_Graph',
        //   Age of Functioning Computers, % of Schools, Province
        'Laos_Schools_Age_Of_Computers_By_School_Type',
        //   Utility/Service Availability at Pre-Primary School Level, Province
        'LA_Laos_Schools_Service_Availability_Percentage_Preschool',
        //   Utility/Service Availability at Primary School Level, Province
        'LA_Laos_Schools_Service_Availability_Percentage_Primary',
        //   Utility/Service Availability at Secondary School Level, Province
        'LA_Laos_Schools_Service_Availability_Percentage_Secondary',
        //   Schools With No Electricity - Distance to Grid, % of Schools, Province
        'Laos_Schools_Distance_To_Grid_By_School_Type',
        //   Resources/Support Received at Pre-Primary School Level, Province
        'LA_Laos_Schools_Resources_Percentage_Preschool',
        //   Resources/Support Received at Primary School Level, Province
        'LA_Laos_Schools_Resources_Percentage_Primary',
        //   Resources/Support Received at Secondary School Level, Province
        'LA_Laos_Schools_Resources_Percentage_Secondary',
      ],
      // District level view (SubDistrict)
      SubDistrict: [
        //   ICT Facilities, % Availability, District
        'Laos_Schools_ICT_Facilities_Bar_Graph',
        //   Age of Functioning Computers, % of Schools, District
        'Laos_Schools_Age_Of_Computers_By_School_Type',
        //   Utility/Service Availability at Pre-Primary School Level, District
        'LA_Laos_Schools_Service_Availability_Percentage_Preschool',
        //   Utility/Service Availability at Primary School Level, District
        'LA_Laos_Schools_Service_Availability_Percentage_Primary',
        //   Utility/Service Availability at Secondary School Level, District
        'LA_Laos_Schools_Service_Availability_Percentage_Secondary',
        //   School Utility/Resource Availability, District
        'Laos_Schools_Binary_Matrix_Availability_By_School_District',
        //   Schools With No Electricity - Distance to Grid, % of Schools, District
        'Laos_Schools_Distance_To_Grid_By_School_Type',
        //   Resources/Support Received at Pre-Primary School Level, District
        'LA_Laos_Schools_Resources_Percentage_Preschool',
        //   Resources/Support Received at Primary School Level, District
        'LA_Laos_Schools_Resources_Percentage_Primary',
        //   Resources/Support Received at Secondary School Level, District
        'LA_Laos_Schools_Resources_Percentage_Secondary',
      ],
      // School level view  (school)
      School: [
        //   ICT Facilities, School
        'Laos_Schools_ICT_Facilities',
      ],
    },
  },
  {
    name: 'COVID',
    codePrefix: 'LA_COVID_',
    userGroup: laosSchoolUser,
    reports: {
      // National level view (Country)
      Country: [
        //   COVID-19, % of Schools, Laos
        'Laos_Schools_COVID_19_Bar_Graph',
        //   Schools Used as Quarantine Centre, % of Schools, Laos
        'Laos_Schools_Used_as_Quarantine_Centre_By_School_Type',
        //   Teaching and Learning, % of Schools, Laos
        'Laos_Schools_Teaching_Learning_Bar_Graph',
        //   Teachers Following MoES Programmes at Home, % of Schools, Laos
        'Laos_Schools_Teachers_Following_MoES_By_School_Type',
        //   Students Following MoES Programmes at Home, % of Schools, Laos
        'Laos_Schools_Students_Following_MoES_By_School_Type',
      ],
      // Provincial level view (District)
      District: [
        //   COVID-19, % of Schools, Province
        'Laos_Schools_COVID_19_Bar_Graph',
        //   Schools Used as Quarantine Centre, % of Schools, Province
        'Laos_Schools_Used_as_Quarantine_Centre_By_School_Type',
        //   Teaching and Learning, % of Schools, Province
        'Laos_Schools_Teaching_Learning_Bar_Graph',
        //   Teachers Following MoES Programmes at Home, % of Schools, Province
        'Laos_Schools_Teachers_Following_MoES_By_School_Type',
        //   Students Following MoES Programmes at Home, % of Schools, Province
        'Laos_Schools_Students_Following_MoES_By_School_Type',
      ],
      // District level view (SubDistrict)
      SubDistrict: [
        //   COVID-19, % of Schools, District
        'Laos_Schools_COVID_19_Bar_Graph',
        //   Schools Used as Quarantine Centre, % of Schools, District
        'Laos_Schools_Used_as_Quarantine_Centre_By_School_Type',
        //   Teaching and Learning, % of Schools, District
        'Laos_Schools_Teaching_Learning_Bar_Graph',
        //   Teachers Following MoES Programmes at Home, % of Schools, District
        'Laos_Schools_Teachers_Following_MoES_By_School_Type',
        //   Students Following MoES Programmes at Home, % of Schools, District
        'Laos_Schools_Students_Following_MoES_By_School_Type',
      ],
      // School level view (school)
      School: [
        //   COVID-19, School
        'Laos_Schools_Covid_19_School_Table',
        //   Teaching and Learning, School
        'Laos_Schools_Teaching_and_Learning_School_Table',
      ],
    },
  },
  {
    name: 'Development Partner Information',
    codePrefix: 'LA_Development_Partner_Information_',
    userGroup: laosSchoolUser,
    reports: {
      // National level view (Country)
      Country: [
        //   Type of Assistance for Emergency Response Provided by Development Partners, Laos
        'SchDP_Partner_Assistance_Types',
        //   Number of Pre-Schools Supported by Development Partners, Laos
        'Laos_Schools_Number_Of_Pre_Schools_Supported_Development_Partners',
        //   Number of Primary Schools Supported by Development Partners, Laos
        'Laos_Schools_Number_Of_Primary_Schools_Supported_Development_Partners',
        //   Number of Secondary Schools Supported by Development Partners, Laos
        'Laos_Schools_Number_Of_Secondary_Schools_Supported_Development_Partners',
      ],
      // Provincial level view (District)
      District: [
        //   Type of Assistance for Emergency Response Provided by Development Partners, Province
        'SchDP_Partner_Assistance_Types',
      ],
      // District level view (SubDistrict)
      SubDistrict: [
        //   Type of Assistance for Emergency Response Provided by Development Partners, District
        'SchDP_Partner_Assistance_Types',
        //   Number of Pre-Schools Supported by Development Partners, District
        'Laos_Schools_Number_Of_Pre_Schools_Supported_Development_Partners',
        //   Number of Primary Schools Supported by Development Partners, District
        'Laos_Schools_Number_Of_Primary_Schools_Supported_Development_Partners',
        //   Number of Secondary Schools Supported by Development Partners, District'
        'Laos_Schools_Number_Of_Secondary_Schools_Supported_Development_Partners',
      ],
    },
  },
];

const defaultDashboardGroup = 'Students / Schools';

const dashboardsToRemoveByName = ['Laos Schools', 'Laos Schools MoES View'];

const underscore = str => str.replace(/ /g, '_');

const createDashboardGroup = (db, dashboardGroup) =>
  insertObject(db, 'dashboardGroup', dashboardGroup);

const populateDashboardGroup = dashboardGroups =>
  dashboardGroups.map(dbg => {
    const entityDashboardGroups = [];
    Object.keys(dbg.reports).forEach(entity => {
      const entityDashbaoardGroup = {
        organisationLevel: entity,
        userGroup: dbg.userGroup,
        organisationUnitCode: 'LA',
        dashboardReports: `{${dbg.reports[entity].join(',')}}`,
        name: dbg.name,
        code: `${dbg.codePrefix}${entity}_${underscore(dbg.userGroup)}`,
        projectCodes: '{laos_schools}',
      };
      entityDashboardGroups.push(entityDashbaoardGroup);
    });
    return entityDashboardGroups;
  });

exports.up = async function (db) {
  const populatedDGs = populateDashboardGroup(newDashboardGroups).flat(1);

  await Promise.all(populatedDGs.map(dbg => createDashboardGroup(db, dbg)));

  return db.runSql(`
    update "project" set "dashboard_group_name" = '${defaultDashboardGroup}' where code = 'laos_schools';    

    delete from "dashboardGroup" where name in (${arrayToDbString(dashboardsToRemoveByName)});
  `);
};

exports.down = function (db) {
  const newCodes = populateDashboardGroup(newDashboardGroups)
    .flat(1)
    .map(dbg => dbg.code);

  db.runSql(`
    update "project" set "dashboard_group_name" = 'Laos Schools' where "code" = 'laos_schools';    

    delete from "dashboardGroup" where "code" in (${arrayToDbString(newCodes)});

    insert into "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code", "projectCodes")
    values 
    ('Country', 'Laos Schools User', 'LA', '{Laos_Schools_Male_Female,SchDP_Partner_Assistance_Types,LA_Laos_Schools_Service_Availability_Percentage_Preschool,LA_Laos_Schools_Service_Availability_Percentage_Primary,LA_Laos_Schools_Service_Availability_Percentage_Secondary,LA_Laos_Schools_Resources_Percentage_Preschool,LA_Laos_Schools_Resources_Percentage_Primary,LA_Laos_Schools_Resources_Percentage_Secondary,Laos_Schools_ICT_Facilities_Bar_Graph,Laos_Schools_COVID_19_Bar_Graph,Laos_Schools_WASH_Bar_Graph,Laos_Schools_Teaching_Learning_Bar_Graph,Laos_Schools_Distance_To_Grid_By_School_Type,Laos_Schools_Age_Of_Computers_By_School_Type,Laos_Schools_Used_as_Quarantine_Centre_By_School_Type,Laos_Schools_Drinking_Water_Source_By_School_Type,Laos_Schools_Water_Supply_Source_By_School_Type,Laos_Schools_Teachers_Following_MoES_By_School_Type,Laos_Schools_Students_Following_MoES_By_School_Type,Laos_Schools_Number_Of_Pre_Schools_Supported_Development_Partners,Laos_Schools_Number_Of_Primary_Schools_Supported_Development_Partners,Laos_Schools_Number_Of_Secondary_Schools_Supported_Development_Partners,Laos_Schools_Number_Of_Schools_By_Type_Table,Laos_Schools_Number_Of_Students_Matrix,Laos_Schools_Textbook_student_Ratio_By_Grade_Primary_Bar,Laos_Schools_Textbook_student_Ratio_By_Grade_Lower_Secondary_Bar,Laos_Schools_Textbook_student_Ratio_By_Grade_Upper_Secondary_Bar}', 'Laos Schools', 'LA_Laos_Schools_Country_Laos_Schools_User', '{laos_schools}'),
    ('District', 'Laos Schools User', 'LA', '{Laos_Schools_Male_Female,Laos_Schools_Dropout_Bar_Primary_Province,Laos_Schools_Dropout_Bar_Lower_Secondary_Province,Laos_Schools_Dropout_Bar_Upper_Secondary_Province,Laos_Schools_Repeaters_Bar_Primary_Province,Laos_Schools_Repeaters_Bar_Lower_Secondary_Province,Laos_Schools_Repeaters_Bar_Upper_Secondary_Province,SchDP_Partner_Assistance_Types,LA_Laos_Schools_Service_Availability_Percentage_Preschool,LA_Laos_Schools_Service_Availability_Percentage_Primary,LA_Laos_Schools_Service_Availability_Percentage_Secondary,LA_Laos_Schools_Resources_Percentage_Preschool,LA_Laos_Schools_Resources_Percentage_Primary,LA_Laos_Schools_Resources_Percentage_Secondary,Laos_Schools_ICT_Facilities_Bar_Graph,Laos_Schools_COVID_19_Bar_Graph,Laos_Schools_WASH_Bar_Graph,Laos_Schools_Teaching_Learning_Bar_Graph,Laos_Schools_Distance_To_Grid_By_School_Type,Laos_Schools_Age_Of_Computers_By_School_Type,Laos_Schools_Used_as_Quarantine_Centre_By_School_Type,Laos_Schools_Drinking_Water_Source_By_School_Type,Laos_Schools_Water_Supply_Source_By_School_Type,Laos_Schools_Teachers_Following_MoES_By_School_Type,Laos_Schools_Students_Following_MoES_By_School_Type,Laos_Schools_Number_Of_Pre_Schools_Supported_Development_Partners,Laos_Schools_Number_Of_Primary_Schools_Supported_Development_Partners,Laos_Schools_Number_Of_Secondary_Schools_Supported_Development_Partners,Laos_Schools_Province_Details_Table_1,Laos_Schools_Number_Of_Schools_By_Type_Table,Laos_Schools_Number_Of_Students_Matrix,Laos_Schools_Textbook_student_Ratio_By_Grade_Primary_Bar,Laos_Schools_Textbook_student_Ratio_By_Grade_Lower_Secondary_Bar,Laos_Schools_Textbook_student_Ratio_By_Grade_Upper_Secondary_Bar}', 'Laos Schools', 'LA_Laos_Schools_Province_Laos_Schools_User', '{laos_schools}'),
    ('SubDistrict', 'Laos Schools User', 'LA', '{Laos_Schools_Male_Female,Laos_Schools_Dropout_Bar_Primary_District,Laos_Schools_Dropout_Bar_Lower_Secondary_District,Laos_Schools_Dropout_Bar_Upper_Secondary_District,Laos_Schools_Repeaters_Bar_Primary_District,Laos_Schools_Repeaters_Bar_Lower_Secondary_District,Laos_Schools_Repeaters_Bar_Upper_Secondary_District,SchDP_Partner_Assistance_Types,LA_Laos_Schools_Service_Availability_Percentage_Preschool,LA_Laos_Schools_Service_Availability_Percentage_Primary,LA_Laos_Schools_Service_Availability_Percentage_Secondary,LA_Laos_Schools_Resources_Percentage_Preschool,LA_Laos_Schools_Resources_Percentage_Primary,LA_Laos_Schools_Resources_Percentage_Secondary,Laos_Schools_Binary_Matrix_Availability_By_School_District,Laos_Schools_ICT_Facilities_Bar_Graph,Laos_Schools_COVID_19_Bar_Graph,Laos_Schools_WASH_Bar_Graph,Laos_Schools_Teaching_Learning_Bar_Graph,Laos_Schools_Distance_To_Grid_By_School_Type,Laos_Schools_Age_Of_Computers_By_School_Type,Laos_Schools_Used_as_Quarantine_Centre_By_School_Type,Laos_Schools_Drinking_Water_Source_By_School_Type,Laos_Schools_Water_Supply_Source_By_School_Type,Laos_Schools_Teachers_Following_MoES_By_School_Type,Laos_Schools_Students_Following_MoES_By_School_Type,Laos_Schools_Number_Of_Pre_Schools_Supported_Development_Partners,Laos_Schools_Number_Of_Primary_Schools_Supported_Development_Partners,Laos_Schools_Number_Of_Secondary_Schools_Supported_Development_Partners,Laos_Schools_District_Details_Table_District_Info,Laos_Schools_District_Details_Table_Province_Info,Laos_Schools_Number_Of_Schools_By_Type_Table,Laos_Schools_Number_Of_Students_Matrix,Laos_Schools_Textbook_student_Ratio_By_Grade_Primary_Bar,Laos_Schools_Textbook_student_Ratio_By_Grade_Lower_Secondary_Bar,Laos_Schools_Textbook_student_Ratio_By_Grade_Upper_Secondary_Bar}', 'Laos Schools', 'LA_Laos_Schools_District_Laos_Schools_User', '{laos_schools}'),
    ('School', 'Laos Schools User', 'LA', '{Laos_Schools_School_Details_Table_1,Laos_Schools_School_Details_Table_2,Laos_Schools_Number_Of_Students_Pre_Primary_School,Laos_Schools_Number_Of_Students_Primary_School,Laos_Schools_Number_Of_Students_Secondary_School,Laos_Schools_Male_Female,Laos_Schools_WASH_School_Table,Laos_Schools_Covid_19_School_Table,Laos_Schools_ICT_Facilities,Laos_Schools_Teaching_and_Learning_School_Table,Laos_Schools_School_Textbooks_Shortage_Primary_School,Laos_Schools_School_Textbooks_Shortage_Lower_Secondary_School,Laos_Schools_School_Textbooks_Shortage_Upper_Secondary_School,Laos_Schools_School_Textbooks_Shortage_By_Key_Subjects_And_Grades_Primary_School,Laos_Schools_Textbooks_Shortage_By_Key_Subjects_And_Grades_Lower_Secondary_School,Laos_Schools_School_Textbooks_Shortage_By_Key_Subjects_And_Grades_Upper_Secondary_School}', 'Laos Schools', 'LA_Laos_Schools_School_Laos_Schools_User', '{laos_schools}'),
    ('Country', 'Laos Schools Super User', 'LA', '{Laos_Schools_Male_Female,SchDP_Partner_Assistance_Types,LA_Laos_Schools_Service_Availability_Percentage_Preschool,LA_Laos_Schools_Service_Availability_Percentage_Primary,LA_Laos_Schools_Service_Availability_Percentage_Secondary,LA_Laos_Schools_Resources_Percentage_Preschool,LA_Laos_Schools_Resources_Percentage_Primary,LA_Laos_Schools_Resources_Percentage_Secondary,Laos_Schools_ICT_Facilities_Bar_Graph,Laos_Schools_COVID_19_Bar_Graph,Laos_Schools_WASH_Bar_Graph,Laos_Schools_Teaching_Learning_Bar_Graph,Laos_Schools_Language_Of_Students,Laos_Schools_Raw_Data_Downloads}', 'Laos Schools MoES View', 'LA_Laos_Schools_Country_Laos_Schools_Super_User', '{laos_schools}'),
    ('District', 'Laos Schools Super User', 'LA', '{Laos_Schools_Male_Female,Laos_Schools_Dropout_Bar_Primary_Province,Laos_Schools_Dropout_Bar_Lower_Secondary_Province,Laos_Schools_Dropout_Bar_Upper_Secondary_Province,Laos_Schools_Repeaters_Bar_Primary_Province,Laos_Schools_Repeaters_Bar_Lower_Secondary_Province,Laos_Schools_Repeaters_Bar_Upper_Secondary_Province,SchDP_Partner_Assistance_Types,LA_Laos_Schools_Service_Availability_Percentage_Preschool,LA_Laos_Schools_Service_Availability_Percentage_Primary,LA_Laos_Schools_Service_Availability_Percentage_Secondary,LA_Laos_Schools_Resources_Percentage_Preschool,LA_Laos_Schools_Resources_Percentage_Primary,LA_Laos_Schools_Resources_Percentage_Secondary,Laos_Schools_ICT_Facilities_Bar_Graph,Laos_Schools_COVID_19_Bar_Graph,Laos_Schools_WASH_Bar_Graph,Laos_Schools_Teaching_Learning_Bar_Graph,Laos_Schools_Language_Of_Students,Laos_Schools_Raw_Data_Downloads}', 'Laos Schools MoES View', 'LA_Laos_Schools_Province_Laos_Schools_Super_User', '{laos_schools}'),
    ('SubDistrict', 'Laos Schools Super User', 'LA', '{Laos_Schools_Male_Female,Laos_Schools_Dropout_Bar_Primary_District,Laos_Schools_Dropout_Bar_Lower_Secondary_District,Laos_Schools_Dropout_Bar_Upper_Secondary_District,Laos_Schools_Repeaters_Bar_Primary_District,Laos_Schools_Repeaters_Bar_Lower_Secondary_District,Laos_Schools_Repeaters_Bar_Upper_Secondary_District,SchDP_Partner_Assistance_Types,LA_Laos_Schools_Service_Availability_Percentage_Preschool,LA_Laos_Schools_Service_Availability_Percentage_Primary,LA_Laos_Schools_Service_Availability_Percentage_Secondary,LA_Laos_Schools_Resources_Percentage_Preschool,LA_Laos_Schools_Resources_Percentage_Primary,LA_Laos_Schools_Resources_Percentage_Secondary,Laos_Schools_Binary_Matrix_Availability_By_School_District,Laos_Schools_ICT_Facilities_Bar_Graph,Laos_Schools_COVID_19_Bar_Graph,Laos_Schools_WASH_Bar_Graph,Laos_Schools_Teaching_Learning_Bar_Graph,Laos_Schools_Language_Of_Students,Laos_Schools_Raw_Data_Downloads}', 'Laos Schools MoES View', 'LA_Laos_Schools_District_Laos_Schools_Super_User', '{laos_schools}'),
    ('School', 'Laos Schools Super User', 'LA', '{Laos_Schools_School_Details_Table_1,Laos_Schools_School_Details_Table_2,Laos_Schools_Number_Of_Students_Pre_Primary_School,Laos_Schools_Number_Of_Students_Primary_School,Laos_Schools_Number_Of_Students_Secondary_School,Laos_Schools_Male_Female,Laos_Schools_WASH_School_Table,Laos_Schools_Covid_19_School_Table,Laos_Schools_ICT_Facilities,Laos_Schools_Teaching_and_Learning_School_Table,Laos_Schools_School_Textbooks_Shortage_Primary_School,Laos_Schools_School_Textbooks_Shortage_Lower_Secondary_School,Laos_Schools_School_Textbooks_Shortage_Upper_Secondary_School,Laos_Schools_School_Textbooks_Shortage_By_Key_Subjects_And_Grades_Primary_School,Laos_Schools_Textbooks_Shortage_By_Key_Subjects_And_Grades_Lower_Secondary_School,Laos_Schools_School_Textbooks_Shortage_By_Key_Subjects_And_Grades_Upper_Secondary_School,Laos_Schools_Language_Of_Students}', 'Laos Schools MoES View', 'LA_Laos_Schools_School_Laos_Schools_Super_User', '{laos_schools}');
  `);

  return null;
};

exports._meta = {
  version: 1,
};
