/* eslint-disable */
const setup = require('./starter-kit/setup');
const { process: coreWorkerProcess } = require('core-worker');
const fs = require('fs');
const nodemailer = require('nodemailer');

const temporaryFilenamePrefix =
  Math.random()
    .toString(36)
    .substring(2, 15) +
  Math.random()
    .toString(36)
    .substring(2, 15);

// Set defaults (overriden by lambda event params but useful for testing).
let chartUrl = 'http://localhost:3001/?organisationUnitCode=TO&viewId=12&dashboardGroupId=13';
let chartType = 'other';
let fileType = 'png';
let exportEmail;
let exportFilename = `/tmp/all${temporaryFilenamePrefix}.${fileType}`;
let emailMessage = '';
let emailSubject = '';
let cookies = [];
let extraConfig = {};

exports.handler = async (event, context, callback) => {
  console.log('Start lambda method');
  // For keeping the browser launch
  context.callbackWaitsForEmptyEventLoop = false;
  chartUrl = event.chartUrl;
  chartType = event.chartType;
  exportEmail = event.email;
  fileType = event.fileType;
  emailAttachFileName = event.exportFileName;
  extraConfig = event.extraConfig;
  exportFilename = `/tmp/all.${fileType}`;
  emailMessage = event.emailMessage;
  emailSubject = event.emailSubject;
  cookies = event.cookies;

  const browser = await setup.getBrowser();
  exports
    .run(browser)
    .then(result => callback(null, result))
    .catch(err => callback(err));
};

const exportMatrix = async page => {
  if (fileType !== 'pdf') {
    throw new Error('Matrix export must be pdf');
  }

  // Wait for Matrix export handlers to be available (after the Matrix has finished loading).
  await page.waitForFunction('window.tupaiaExportProps');

  // Initialise the Matrix exporter. This turns the matrix into a clipped, pageable UI that
  // can be modified by the exporter.
  await page.evaluate(`window.tupaiaExportProps.initExporter(${JSON.stringify(extraConfig)})`);

  const files = [];
  let exportComplete = false;
  let pageCounter = 0;
  while (!exportComplete) {
    const fileName = `/tmp/page${temporaryFilenamePrefix}${pageCounter}.pdf`;
    files.push(fileName);

    await page.pdf({
      path: fileName,
      format: 'A4',
      printBackground: true,
      landscape: true,
    });

    // Run the next page script which advanced to the next column or row and returns true.
    // Returns false if there was no page to advance to.
    exportComplete = !(await page.evaluate('window.tupaiaExportProps.moveToNextExportPage()'));
    pageCounter++;
    console.log(`Created ${fileName}`);
  }

  console.log('Screenshots complete');
  await coreWorkerProcess(
    `ghostscript/bin/gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=${exportFilename} ${files.join(
      ' ',
    )}`,
  ).death();
  console.log('Screenshot combining complete');
};

const exportPage = async page => {
  if (fileType === 'pdf') {
    await page.pdf({
      path: exportFilename,
      format: 'A4',
      printBackground: true,
      landscape: true,
    });
  } else if (fileType === 'png') {
    await page.screenshot({
      path: exportFilename,
      fullPage: true,
    });
  } else {
    throw new Error(`Unknown file type ${fileType}`);
  }
};

const sendCompletionEmail = async () => {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: process.env.SMTP_HOST,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  console.log(`Emailing to ${exportEmail}`);

  return transporter.sendMail({
    from: process.env.SITE_EMAIL_ADDRESS,
    to: exportEmail,
    subject: emailSubject,
    html: emailMessage,
    attachments: [
      {
        filename: emailAttachFileName,
        content: fs.createReadStream(exportFilename),
      },
    ],
  });
};

const setCookie = async page => {
  for (let c = 0; c < cookies.length; c++) {
    await page.setCookie(cookies[c]);
  }
};

exports.run = async browser => {
  console.log('Begin running');
  const page = await browser.newPage();
  console.log('Browser launched');

  await setCookie(page);
  console.log('Set cookies');

  await page.goto(chartUrl);
  console.log('Page visited', chartUrl);
  await page.setViewport({ width: 1000, height: 720 });
  await page.waitForNavigation({ waitUntil: 'networkidle', networkIdleTimeout: 3000 });

  if (chartType === 'matrix') {
    await exportMatrix(page);
  } else {
    await exportPage(page);
  }

  console.log('Export complete');

  await sendCompletionEmail();
  console.log('Email sent');

  await page.close();
  return 'done';
};
