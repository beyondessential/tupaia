CREATE TABLE survey_group (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
CREATE INDEX ON survey_group(name);

ALTER TABLE survey
ADD survey_group_id TEXT REFERENCES survey_group(id) ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX ON survey(survey_group_id);

CREATE TRIGGER survey_group_trigger AFTER INSERT OR UPDATE or DELETE ON survey_group
FOR EACH ROW EXECUTE PROCEDURE notification();
