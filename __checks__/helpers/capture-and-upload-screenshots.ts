const aws4 = require('aws4');
const axios = require('axios').default;
const { format } = require('date-fns');

const S3_BUCKET_NAME = process.env.PMC_SCREENSHOT_DASHBOARD_S3_BUCKET_NAME;
const AWS_REGION = process.env.PMC_SCREENSHOT_DASHBOARD_BUCKET_REGION;
const ACCESS_KEY_ID = process.env.PMC_SCREENSHOT_DASHBOARD_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.PMC_SCREENSHOT_DASHBOARD_SECRET_ACCESS_KEY;

// Define timestamp for folder.
const now = new Date();
const timestamp = format(now, 'yyyy-MM-dd-HH:mm:ss');

/**
 * Capture screenshots and upload them to S3.
 *
 * @param {?} page
 * @param {?string} url
 */
export async function captureAndUploadScreenshots ({
  page,
  url = null,
}) {

  // Parse the url right away.
  const pathParts = getPathPartsByUrl(url);
  if ( ! pathParts ) {
    return false;
  }

  const { hostname, pathname } = pathParts;

  // Hide ads.
  const urlObj = new URL( url );
  urlObj.searchParams.set( 'skconfig', 's::true' );
  url = urlObj.toString();

  // Close OneTrust.
  await page.addScriptTag({ content: 'window.OneTrust.Close();' });

  const bauModal = await page.$( 'div.tp-modal .tp-close' );
  if ( bauModal ) {
    await bauModal.click();
  }

  await page.setViewportSize({ height: 1200, width: 1300 });
  await page.goto(url || 'https://google.com' );
  const desktopScreenshot = await page.screenshot({ fullPage: true, path: 'desktopScreenshot.jpg' });
  await processScreenshot({
    screenshot: desktopScreenshot,
    name: 'desktop',
    hostname,
    pathname,
  });

  await page.setViewportSize({ height: 1200, width: 800 });
  await page.goto(url || 'https://google.com' );
  const tabletScreenshot = await page.screenshot({ fullPage: true, path: 'tabletScreenshot.jpg' });
  processScreenshot({
    screenshot: tabletScreenshot,
    name: 'tablet',
    hostname,
    pathname,
  });

  await page.setViewportSize({ height: 1200, width: 400 });
  await page.goto(url || 'https://google.com' );
  const mobileScreenshot = await page.screenshot({ fullPage: true, path: 'mobileScreenshot.jpg' });
  processScreenshot({
    screenshot: mobileScreenshot,
    name: 'mobile',
    hostname,
    pathname,
  });

  // Trigger a Slack notification endpoint with a link to these new
  // screenshots.
  const prefx = `screenshots/${hostname}/${pathname}/${timestamp}/`;
  await request({
    method: 'POST',
    host: 'pmc-wayback-machine.vercel.app'
    path: '/api/v1/slack/notification-for-capture',
    headers: {
      // Some kind of auth token here. We need to validate this is coming from
      // our Checkly account.
    },
    body: {
      prefix,
    },
  });

  // @todo Include the screenshot urls in this response?
  return {
    success: true,
  };
}

/**
 * Upload the screenshot to S3.
 *
 * @param {string} name       Name of the file.
 * @param {string} screenshot File data.
 * @param {string} url        URL for the screenshot.
 */
const processScreenshot = async ({
  hostname,
  name,
  pathname,
  screenshot,
}) => {
  const requestOptions = {
    host: `${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com`,
    method: 'PUT',
    path: `/screenshots/${hostname}/${pathname}/${timestamp}/${name}.jpeg`,
    body: screenshot,
    headers: {
      'Content-Type': 'image/jpeg',
    },
  };

  const creds = {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  };

  const opts = aws4.sign(requestOptions, creds);

  await request(opts);

  // If this fails, the aws4 library will throw an error. Otherwise assume
  // success.
  return true;
}

/**
 * Fire the S3 upload request.
 *
 * @param {object} opts Request options.
 */
async function request(opts) {
  try {
    return await axios({
      method: opts.method || 'GET',
      url: `https://${opts.host}${opts.path}`,
      headers: opts.headers || {},
      data: opts.body || '',
    });
  } catch (error) {
    return false;
  }
}

/**
 * Parse url and return a pathname and hostname sanitized for S3.
 *
 * @type {object|boolean}
 */
const getPathPartsByUrl = (url) => {
  try {
    const { hostname, pathname } = new URL(url);
    return {
      pathname: pathname.replace(/[^a-zA-Z0-9]/g, '_'),
      hostname: hostname.replace(/[^a-zA-Z0-9]/g, '_'),
    };
  } catch (error) {
    return false;
  }
};
