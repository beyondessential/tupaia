import { respond } from '@tupaia/utils';

function buildProjectData(project) {
  const {
    name,
    code,
    description,
    sort_order: sortOrder,
    image_url: imageUrl,
    logo_url: logoUrl,
    permission_groups: permissionGroups,
    dashboard_group_name: dashboardGroupName,
    default_measure: defaultMeasure,
    config,
  } = project;

  return {
    name,
    code,
    permissionGroups,
    description,
    sortOrder,
    imageUrl,
    logoUrl,
    dashboardGroupName,
    defaultMeasure,
    config,
  };
}

async function buildLandingPageDataForFrontend(landingPage, req) {
  const projectData = await req.models.project.find({ code: landingPage.project_codes });
  const projects = projectData.map(project => buildProjectData(project));

  const {
    name,
    image_url: imageUrl,
    logo_url: logoUrl,
    primary_hexcode: primaryHexcode,
    secondary_hexcode: secondaryHexcode,
    long_bio: longBio,
    contact_us: contactUs,
    external_link: externalLink,
    phone_number: phoneNumber,
    website_url: websiteUrl,
    include_name_in_header: includeNameInHeader,
    extended_title: extendedTitle,
  } = landingPage;

  return {
    name,
    imageUrl,
    logoUrl,
    primaryHexcode,
    secondaryHexcode,
    longBio,
    contactUs,
    externalLink,
    phoneNumber,
    websiteUrl,
    includeNameInHeader,
    extendedTitle,
    projects,
  };
}

export async function getLandingPage(req, res) {
  const { landingPageUrl } = req.params;

  const landingPage = await req.models.landingPage.findOne({ url_segment: landingPageUrl });

  if (!landingPage) {
    return respond(res, null, 200);
  }
  return respond(res, await buildLandingPageDataForFrontend(landingPage, req), 200);
}
