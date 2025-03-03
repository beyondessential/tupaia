import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import { PHONE_CONTACT, WEBSITE_CONTACT } from './constants';

export const ABOUT_PAGE = {
  en: {
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
          utilization for monitoring, planning and setting policy.
        </Typography>
      </>
    ),
  },
  lo: {
    title: 'ກ່ຽວກັບ LESMIS',
    url: 'about',
    body: (
      <>
        <Typography variant="h1" gutterBottom>
          ກ່ຽວກັບ LESMIS
        </Typography>
        <Typography>
          ລະບົບຂໍ້ມູນຂ່າວສານການຄຸ້ມຄອງການສຶກສາ ແລະ ກິລາຂອງ ສປປ ລາວ (LESMIS)
          ເປັນລະບົບທີ່ເປັນການລວບລວມຂໍ້ມູນ, ການວິເຄາະ ແລະ ການສ້າງພາບທີ່ນຳໃຊ້ GIS
          ເພື່ອປັບປຸງການຄຸ້ມຄອງຂໍ້ມູນ ແລະ ນຳໃຊ້ເຂົ້າໃນການຕິດຕາມ ແລະ ວາງແຜນ
        </Typography>
      </>
    ),
  },
};

export const CONTACT_PAGE = {
  en: {
    title: 'Contact Us',
    url: 'contact',
    body: (
      <>
        <Typography variant="h1" gutterBottom>
          Contact Us
        </Typography>
        <Box mb={5}>
          <Typography variant="h2">Phone</Typography>
          <Typography>{PHONE_CONTACT}</Typography>
        </Box>
        <Box mb={5}>
          <Typography variant="h2">Website</Typography>
          <Typography>{WEBSITE_CONTACT}</Typography>
        </Box>
      </>
    ),
  },
  lo: {
    title: 'ຕິດຕໍ່ພວກເຮົົາ',
    url: 'contact',
    body: (
      <>
        <Typography variant="h1" gutterBottom>
          ຕິດຕໍ່ພວກເຮົົາ
        </Typography>
        <Box mb={5}>
          <Typography variant="h2">ໂທ</Typography>
          <Typography>{PHONE_CONTACT}</Typography>
        </Box>
        <Box mb={5}>
          <Typography variant="h2">ເວບໄຊ</Typography>
          <Typography>{WEBSITE_CONTACT}</Typography>
        </Box>
      </>
    ),
  },
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
  en: {
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
              those standards that need improvement {"->"} priorities for improvement to be included in
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
            easy-to-understand formats, like the School profile. This will allow for better
            targeting of support to schools (see{' '}
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
              FQS – Part 3 on student outcomes consist of 20 curriculum standards for Lao language
              and mathematics, for all Grades.
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
            responsibility of all concerned stakeholders, including parents and communities, the
            DESB and other cluster schools.
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
            The enhanced ICT enabled school development process aim for the identification of
            schools’ strengths and areas for improvement based on the FQS Part 1, 2 and 3. The FQS
            data allow for allocating schools in one of the three School Support Categories. Schools
            that do less well will receive more support from the DESB. The ‘support package’ is
            quantified in the number of days of support (school visits) by pedagogical advisors
            and/or other DESB staff each year.
          </Typography>
        </Box>
      </>
    ),
  },
  lo: {
    title: 'ມາດຕະຖານຄຸນນະພາບຂັ້ນພື້ນຖານ ໂດຍອີງໃສ່ແຜນພັດທະນາໂຮງຮຽນ',
    url: 'fundamental-quality-standards',
    linkSections: [
      {
        heading: 'ແບບສອບຖາມອອນລາຍ ສໍາລັບໂຮງຮຽນໃນການປະເມີນຕົນເອັງ ແລະ ການສ້າງແຜນພັດທະນາ',
        links: [
          {
            name: 'ມຄພ ພາກທີ່ 1: "ປັດໃຈນໍາເຂົ້າ" ແບບສອບຖາມເພື່ອປະເມີນຕົນເອັງ',
            link: 'https://ee.humanitarianresponse.info/x/9JxwymGJ',
          },
          {
            name: 'ມຄພ ພາກທີ່ 2: "ຂະບວນການ & ພຶດຕິກຳ" ແບບສອບຖາມເພື່ອປະເມີນຕົນເອັງ',
            link: 'https://ee.humanitarianresponse.info/x/fFTw9mdC',
          },
          {
            name: 'ມຄພ ພາກທີ່ 3: "ຜົນການຮຽນຂອງນັກຮຽນ" ແບບສອບຖາມເພື່ອປະເມີນຕົນເອັງ',
            link: 'https://ee.humanitarianresponse.info/x/o6cITlj2',
          },
          {
            name: 'ແບບສອບຖາມເພື່ອສ້າງແຜນພັດທະນາໂຮງຮຽນ',
            link: 'https://ee.humanitarianresponse.info/x/9TZePw7I',
          },
        ],
      },
      {
        heading: 'ແຫຼ່ງຂໍ້ມູນອື່ນໆ',
        links: [
          { name: 'ຄູ່ມືການພັດທະນາໂຮງຮຽນຕາມມາດຕະຖານຄຸນນະພາບຂັ້ນພື້ນຖານ ຊັ້ນປະຖົມສຶກສາ', link: '' },
        ],
      },
    ],
    body: (
      <>
        <Box mb={3}>
          <Typography variant="h2" gutterBottom>
            ມາດຕະຖານຄຸນນະພາບຂັ້ນພື້ນຖານ ໂດຍອີງໃສ່ແຜນພັດທະນາໂຮງຮຽນ
          </Typography>
          <Typography gutterBottom>
            ມາດຕະຖານຄຸນນະພາບຂັ້ນພື້ນຖານ (ມຄພ) ມີຈຸດປະສົງເພື່ອສະໜັບສະໜູນ ໂຮງຮຽນໃນຄວາມພະຍາຍາມ
            ພັດທະນາໂຮງຮຽນ; ເປົ້າໝາຍກໍແມ່ນເພື່ອແນໃສ່ການປັບປຸງການຮຽນຂອງນັກຮຽນ.
          </Typography>
          <Typography>
            ມຄພ ກໍານົດວ່າໂຮງຮຽນຄວນມີຈຸດປະສົງເພື່ອບັນລຸເປົ້າໝາຍຫຍັງ. ຂັ້ນຕອນການປະເມີນຕົນເອງ ແລະ
            ການວາງແຜນພັດທະນາໂຮງຮຽນ ຕາມມາດຕະຖານຄຸນນະພາບຂັ້ນພື້ນຖານໂຮງຮຽນ ຊ່ວຍູໂຮງຮຽນໃນການກຳນົດ:
          </Typography>
          <List>
            <ListItem component="li">
              ມາຕະຖານໄດທີ່ໄດ້ບັນລຸແລ້ວ, ມາຕະຖານໄດທີ່ຕ້ອງປັບປຸງ ຫຼື້ "ເປັນບົດຮຽນທິ່ດີ"
              ທີ່ສາມາດແບ່ງປັນກັບໂຮງຮຽນອື່ນພາຍໃນກຸ່ມໂຮງຮຽນ.
            </ListItem>
            <ListItem component="li">
              ບັນດາມາດຕະຖານທີ່ຕ້ອງການໆປັບປຸງ {"->"} ບູລິມະສິດສຳລັບການປັບປຸງ ຄວນລວມຢູ່ໃນແຜນ
              ພັດທະນາໂຮງຮຽນ.
            </ListItem>
          </List>
          <Typography component="li">
            ຂະບວນການ ສ້າງແຜນພັດທະນາໂຮງຮຽນ ໂດຍອີງໃສ່ມາດຕະຖານຄຸນນະພາບຂັ້ນພື້ນຖານ ແມ່ນນຳໃຊ້ລະບົບ ICT,
            ໝາຍຄວາມວ່າມັນສົ່ງເສີມການນຳ ໃຊ້ແບບສອບຖາມອອນລາຍ ເພື່ອສະໜັບສະໜູນໂຮງຮຽນໃນການປະເມີນຕົນເອງ ແລະ
            ສ້າງແຜນພັດທະນາ.
          </Typography>
          <Typography>
            ຂໍ້ມູນທີ່ສົ່ງຜ່ານທາງອິນເຕີເນັດສໍາລັບໂຮງຮຽນຂອງທ່ານຈະຖືກນຳສະເໜີໃນ ລະບົບ LESMIS
            ໃນຮູບແບບທີ່ເຂົ້າໃຈງ່າຍ, ເຊັ່ນບົດລາຍງານຂໍ້ມູນຂອງໂຮງຮຽນ. ນີ້ຈະຊ່ວຍໃຫ້ມີການຕັ້ງເປົ້າ
            ໝາຍທີ່ດີໃນການສະໜັບສະໜູນໃຫ້ແກ່ໂຮງຮຽນ (
            <Link href="#school-support-categories">ເບິ່ງປະເພດສະໜັບສະໜູນໂຮງຮຽນ ຂ້າງລຸ່ມນີ້</Link>).
          </Typography>
        </Box>
        <Box mb={3}>
          <Typography variant="h2" gutterBottom>
            ຮຽນຮູ້ເພີ່ມຕື່ມກ່ຽວກັບມາດຕະຖານຄຸນນະພາບຂັ້ນພື້ນຖານ ຊັ້ນປະຖົມສຶກສາ
          </Typography>
          <Typography>ມາດຕະຖານຄຸນນະພາບຂັ້ນພື້ນຖານ ຊັ້ນປະຖົມສຶກສາ ປະກອບມີ 3 ພາກ:</Typography>
          <List>
            <ListItem component="li">
              ພາກທີ່ 1: ປະກອບມີ 27 ມາດຖານ "ປັດໃຈນໍາເຂົ້າ" (ເຊັ່ນ: ປື້ມແບບຮຽນ ຫຼືກະດານດຳ)
            </ListItem>
            <ListItem component="li">
              ພາກທີ່ 2: ປະກອບມີ 23 ມາດຖານ "ຂະບວນການ & ພຶດຕິກຳ" ເພື່ອສະໜັບສະໜູນ
              ການພັດທະນາໂດບລວມຂອງໂຮງຮຽນ ແລະ ປັບປຸງການສອນ ແລະ ການຮຽນຂອງນັກຮຽນ
            </ListItem>
            <ListItem component="li">
              ພາກທີ່ 3: "ຜົນການຮຽນຂອງນັກຮຽນ" ປະກອບມີ 20 ມາດຕະຖານຈາກຫຼັກສູດສຳລັບພາສາລາວ ແລະ ຄະນິດສາດ,
              ສຳລັບທຸກໆຊັ້ນຮຽນ
            </ListItem>
          </List>
          <Image src="/images/fqs-overview-diagram-la.png" />
        </Box>
        <Box mb={3}>
          <Typography variant="h2" gutterBottom>
            ການພັດທະນາໂຮງຮຽນແບບມີສ່ວນຮ່ວມ
          </Typography>
          <Typography>
            ການພັດທະນາໂຮງຮຽນໃຫ້ປະສົບຜົນສຳເລັດແມ່ນຂື້ນກັບການມີສ່ວນຮ່ວມ ແລະ
            ແມ່ນຄວາມຮັບຜິດຊອບຂອງທຸກພາກສ່ວນທີ່ກ່ຽວຂ້ອງ, ລວມທັງພໍ່ແມ່, ຊຸມຊົນ, ສຶກສາເມືອງ ແລະ
            ກຸ່ມໂຮງຮຽນ.
          </Typography>
          <Image src="/images/fqs-school-improvement-diagram-la.png" />
        </Box>
        <Box mb={3}>
          <Typography variant="h2" gutterBottom>
            ຂັ້ນຕອນການສ້າງແຜນພັດທະນາໂຮງຮຽນຕາມມາດຕະຖານຄຸນນະພາບຂັ້ນພື້ນຖານ
          </Typography>
          <Typography>
            ຂັ້ນຕອນການສ້າງແຜນພັດທະນາໂຮງຮຽນແມ່ນປະກອບດ້ວຍ 4 ບາດກ້າວ. (ຂັ້ນຕອນທີ 1)
            ການກະກຽມໂດຄະນະກໍາມະການສ້າງແຜນພັດທະນາໂຮງຮຽນ ເລີ້ມໃນຕົ້ນເດືອນທັນວາ.
            ແຜນພັດທະນາໂຮງຮຽນຄວນໃຫ້ສຳເລັດພາຍໃນອາທິດທີ 2 ຂອງເດືອນມັງກອນ
            ຢ່າງໜ້ອຍໃຫ້ທັນແຈ້ງເຂົ້າແຜນການປະຕິບັດລາຍຈ່າຍປະຈຳປີຂອງຫ້ອງການສຶກສາທິການ ແລະ ກິລາ ຂັ້ນເມືອງ
            (ACEP).
          </Typography>
          <Image src="/images/fqs-planning-diagram-la.png" />
        </Box>
        <Box mb={3} id="school-support-categories">
          <Typography variant="h2" gutterBottom>
            ປະເພດການສະໜັບສະໜູນໂຮງຮຽນ
          </Typography>
          <Typography>
            ການນໍາໃຊ້ລະບົບ ICT ເຂົ້າໃນຂະບວນການສ້າງແຜນພັດທະນາໂຮງຮຽນ ໄດ້ແນໃສ່ການກຳ ນົດຈຸດແຂງ ແລະ
            ສີ່ງທີ່ປັບປຸງຂອງໂຮງຮຽນ ອີງໃສ່ ມຄພ ພາກ 1, 2 ແລະ 3. ຂໍ້ມູນຂອງ ມຄພ ຈະຊ່ວຍໃນການຈັດວ່າ
            ໂຮງຮຽນຕ້ອງການໆສະໜັບສະໜູນໄດ ພາຍໃນ 3 ປະເພດການສະໜັບສະໜູນ.
            ໂຮງຮຽນທີ່ເຮັດບໍ່ໄດ້ດີຈະໄດ້ຮັບການສະໜັບສະໜູນຈາກສຶກສາທິການ ແລະ ກິລາ ເມືອງ. “
            ຊຸດການສະໜັບສະໜູນ” ແມ່ນຖືກຄິດໄລ່ຕາມຈຳນວນມື້ທີ່ໄດ້ຮັບການສະໜັບສະໜູນ (ການລົງຕິດຕາມໂຮງຮຽນ)
            ໂດຍຄູນິເທດ ແລະ/ຫຼື ພະນັກງານ ສຶກສາທິການ ແລະ ກິລາ ເມືອງ ໃນແຕ່ລະປີ.
          </Typography>
        </Box>
      </>
    ),
  },
};
