'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const landingContent = `
  <hr />
  <p><b>FluTracking is a crowd-sourced surveillance system that harnesses the power of the internet and community spirit for monitoring Influenza, COVID-19 and other disease issues in Australia and overseas. Over 140,000 people across Australia and NZ participate in Flutracking each week</b></p>
  <p>In addition to tracking markers of Influenza across the community, since 2020, the project has additionally looked for markers of COVID-19 across the community.</p>
  <p>Tupaia presents mapping-led visualisations of FluTracking information using weekly data, with the support of the Indo-Pacific Centre for Health Security.</p>
  <p>FluTracking is run by the Hunter New England Local Health District.</p>
  <p style="font-size:13px;">FOR MORE INFORMATION</p>
  <section>
  <style scoped>
    .solid {
      color: white;
      background: #EE612E;
      border-radius: 3px;
      border: none;
      height: 42px;
      padding: 0 29px;
      margin-right: 16px;
    }
    .solid:active {
      background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), #EE612E;
    }
    .ghost {
      color: #EE612E;
      background: transparent;
      border-radius: 3px;
      border: 1px solid #EE612E;
      height: 42px;
      padding: 0 29px;
    }
    .ghost:active {
      background: #EE612E;
      color: #FFFFFF;
    }
  </style>
    <a target="_blank" href="https://info.flutracking.net/"><button class="solid">More information</button></a>
    <a target="_blank" href="https://info.flutracking.net/"><button class="ghost">Join now!</button></a>
  </section>
  <hr style="margin-top: 14px" />
  <a style="color: #EE612E; font-size: 12px;" target="_blank" href="https://info.flutracking.net/">https://info.flutracking.net/</a>
`;

exports.up = function(db) {
  return db.runSql(`
    update "project"
    set "long_description" = '${landingContent}', "description" = 'FluTracking data, COVID-19 cases, deaths and testing'
    where "code" = 'covidau';
    
    update "entity"
    set "name" = 'FluTracking & COVID-19 Australia'
    where "code" = 'covidau';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
