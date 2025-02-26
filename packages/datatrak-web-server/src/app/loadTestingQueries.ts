export const SURVEY_ID = '62b015be60209041ec00281a';

export const INSERT_SURVEY = `
    INSERT INTO survey (
        id, 
        name, 
        code, 
        permission_group_id, 
        country_ids, 
        can_repeat, 
        survey_group_id, 
        integration_metadata, 
        period_granularity, 
        requires_approval, 
        data_group_id, 
        project_id
    ) 
    VALUES (
        ?, 
        ?, 
        ?, 
        '639abb94dbde622fb60dae49', 
        '{5e38b60f61f76a05ff1ade80}', 
        false, 
        '62a40b71f0d8ba7f3c0044c8', 
        '{}', 
        'monthly'::period_granularity, 
        false, 
        '62b189abc54f9206182d893d', 
        '5ff7949f61f76a2a07000004')

`;

export const INSERT_SURVEY_RESPONSE = `
    INSERT INTO survey_response (
        id,
        survey_id, 
        user_id, 
        assessor_name, 
        start_time, 
        end_time, 
        entity_id,
        data_time,
        outdated
    )
    -- SELECT jsonb_build_object
    VALUES (
        ?, 
        ?, 
        '5f42f7d361f76a559504c0f0',
        'Petelo Manu',
        now(),
        now(),
        '62f17d3b32886b81ec90ee4d',
        now(),
        false
    );
`;

export const INSERT_DATA_ELEMENTS = `
    INSERT INTO data_element (
        id, 
        code, 
        config,
        service_type,
        permission_groups
    ) VALUES (
        ?, 
        'NauruNCDAudit_033'::text, 
        '{}'::jsonb,
        'tupaia'::service_type,
        '{Nauru eHealth}'
    );
`;

export const INSERT_QUESTIONS = `
    INSERT INTO question (
        id, 
        type,
        text, 
        name, 
        options, 
        code, 
        detail, 
        option_set_id, 
        hook, 
        data_element_id
    ) 
    VALUES (
        ?, 
        'Instruction'::question_type,
        'Please identify the key issues and recommendations'::text, 
        null::text, 
        null, 
        null::text, 
        null::varchar, 
        null::text, 
        null::text, 
        ?
    );
`;

export const INSERT_SURVEY_RESPONSE_ANSWERS = `
    INSERT INTO answer (
        id, 
        type, 
        survey_response_id, 
        question_id, 
        text
    ) VALUES (
        ?, 
        'CodeGenerator'::text, 
        ?, 
        ?, 
        'AAX-C8G-JJN-DFRH'::text
    );
`;

export const TABLES = {
  SURVEY_RESPONSE: 'survey_response',
  DATA_ELEMENT: 'data_element',
  QUESTION: 'question',
  ANSWER: 'answer',
};

export const TABLE_INSERT_QUERIES = {
  [TABLES.SURVEY_RESPONSE]: INSERT_SURVEY_RESPONSE,
  [TABLES.DATA_ELEMENT]: INSERT_DATA_ELEMENTS,
  [TABLES.QUESTION]: INSERT_QUESTIONS,
  [TABLES.ANSWER]: INSERT_SURVEY_RESPONSE_ANSWERS,
};
