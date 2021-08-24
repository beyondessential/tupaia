/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';

export const ABOUT_PAGE = {
  title: 'About LESMIS',
  url: 'about',
  body: (
    <>
      <Typography variant="h1" gutterBottom>
        About LESMIS
      </Typography>
      <Typography>
        The Lao PDR Education and Sports Management Information System (LESMIS) is a GIS-enabled
        data aggregation, analysis and visualization platform for improved data management and
        utilization for monitoring and planning.
      </Typography>
    </>
  ),
};

export const CONTACT_PAGE = {
  title: 'Contact Us',
  url: 'contact',
  body: (
    <>
      <Typography variant="h1" gutterBottom>
        Contact Us
      </Typography>
      <Box mb={5}>
        <Typography variant="h2">Phone</Typography>
        <Typography>+856 20 55617710</Typography>
      </Box>
      <Box mb={5}>
        <Typography variant="h2">Website</Typography>
        <Typography>www.moes.edu.la</Typography>
      </Box>
    </>
  ),
};

const List = styled.ul`
  margin-bottom: 1.2rem;
`;

const ListItem = styled(Typography)`
  margin-bottom: 0.8rem;
`;

const Image = styled.img`
  max-width: 100%;
  width: 100%;
  margin: 0.5rem 0;
  border-radius: 3px;
  overflow: hidden;
`;

export const FQS_PAGE = {
  title: 'Fundamental Quality Standards (FQS)',
  url: 'fundamental-quality-standards',
  linkSections: [
    {
      heading: 'Online questionnaires for school self-assessment and development planning',
      links: [
        {
          name: 'FQS1 (ມຄພ) – “Inputs” self-assessment questionnaire',
          link: 'https://ee.humanitarianresponse.info/x/9JxwymGJ',
        },
        {
          name: 'FQS2 (ມຄພ) – “Behaviours & processes” self-assessment questionnaire',
          link: 'https://ee.humanitarianresponse.info/x/fFTw9mdC',
        },
        {
          name: 'FQS3 (ມຄພ) – “student outcomes” questionnaire',
          link: 'https://ee.humanitarianresponse.info/x/o6cITlj2',
        },
        {
          name: 'School development plan questionnaire',
          link: 'https://ee.humanitarianresponse.info/x/9TZePw7I',
        },
      ],
    },
    {
      heading: 'Other resources',
      links: [{ name: 'MoES FQS-based Primary School Development Guidelines', link: '' }],
    },
  ],
  body: (
    <>
      <Box mb={3}>
        <Typography variant="h2" gutterBottom>
          Fundamental Quality Standards-based school development
        </Typography>
        <Typography gutterBottom>
          The MoES Primary Fundamental Quality Standards (FQS) aim to support schools in their
          development efforts; ultimately aimed at enhancing student learning.
        </Typography>
        <Typography>
          The FQS define what a school should aim to achieve. The FQS-based school self-assessment
          and development planning process supports schools in identifying:
        </Typography>
        <List>
          <ListItem component="li">
            those standards that are achieved, some of which may be considered strengths or “good
            practices” that could be shared with other cluster schools.
          </ListItem>
          <ListItem component="li">
            those standards that need improvement -> priorities for improvement to be included in
            the school development plan.
          </ListItem>
        </List>
        <Typography gutterBottom>
          The FQS-based school development process is ICT-enabled, meaning it promotes the use of
          online questionnaires to support schools in their self-assessment and development
          planning.
        </Typography>
        <Typography>
          The online submitted data on your school will be presented on the LESMIS platform in
          easy-to-understand formats, like the School profile. This will allow for better targeting
          of support to schools (see{' '}
          <Link href="#school-support-categories">School Support Categories</Link> below).
        </Typography>
      </Box>
      <Box mb={3}>
        <Typography variant="h2" gutterBottom>
          Learn more about the Primary Fundamental Quality Standards
        </Typography>
        <Typography>
          The Fundamental Quality Standards (FQS) for primary schools consists of three parts:
        </Typography>
        <List>
          <ListItem component="li">
            The FQS – Part 1 consists of 27 “input” standards (e.g. textbooks or blackboard).
          </ListItem>
          <ListItem component="li">
            The FQS – Part 2 consist of 23 “processes & “behaviors” to support the holistic
            development of the school and improvements in teaching and student learning.
          </ListItem>
          <ListItem component="li">
            FQS – Part 3 on student outcomes consist of 20 curriculum standards for Lao language and
            mathematics, for all Grades.
          </ListItem>
        </List>
        <Image src="/images/fqs-overview-diagram.png" />
      </Box>
      <Box mb={3}>
        <Typography variant="h2" gutterBottom>
          Participatory approach to school development
        </Typography>
        <Typography>
          The successful development of your school depends on the strong participation and
          responsibility of all concerned stakeholders, including parents and communities, the DESB
          and other cluster schools.
        </Typography>
        <Image src="/images/fqs-school-improvement-diagram.png" />
      </Box>
      <Box mb={3}>
        <Typography variant="h2" gutterBottom>
          FQS-based school development planning process
        </Typography>
        <Typography>
          The school development planning process is made up of four Steps. Preparations by the
          School Development Planning Taskforce (Step 1) start in early December. The school
          development plan should be completed by second week of January the latest to be able to
          inform the district education costed annual action plan (ACEP).
        </Typography>
        <Image src="/images/fqs-planning-diagram.png" />
      </Box>
      <Box mb={3} id="school-support-categories">
        <Typography variant="h2" gutterBottom>
          School Support Categories
        </Typography>
        <Typography>
          The enhanced ICT enabled school development process aim for the identification of schools’
          strengths and areas for improvement based on the FQS Part 1, 2 and 3. The FQS data allow
          for allocating schools in one of the three School Support Categories. Schools that do less
          well will receive more support from the DESB. The ‘support package’ is quantified in the
          number of days of support (school visits) by pedagogical advisors and/or other DESB staff
          each year.
        </Typography>
      </Box>
    </>
  ),
};
