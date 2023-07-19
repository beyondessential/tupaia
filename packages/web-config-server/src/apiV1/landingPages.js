import { respond } from '@tupaia/utils';
import { buildProjectDataForFrontend } from './projects';

async function buildLandingPageDataForFrontend(landingPage, req) {
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
    project_codes: projectCodes,
  } = landingPage;

  // Fetch all the projects with their entity_ids
  const allProjects = await req.models.project.getAllProjectDetails();

  // Filter to only the projects that are included in the landing page
  const applicableProjects = allProjects.filter(project => projectCodes.includes(project.code));

  // Build the project data for the frontend, using the method from the projects API, so that we get the same information returned, including permissions
  const projects = await Promise.all(
    applicableProjects.map(project => buildProjectDataForFrontend(project, req)),
  );

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
