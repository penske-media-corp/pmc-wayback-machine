import { captureAndUploadScreenshots } from './helpers/capture-and-upload-screenshots';

const { expect, test } = require('@playwright/test');

// Configure the Playwright Test timeout to 210 seconds,
// ensuring that longer tests conclude before Checkly's browser check timeout of 240 seconds.
// The default Playwright Test timeout is set at 30 seconds.
// For additional information on timeouts, visit: https://checklyhq.com/docs/browser-checks/timeouts/
test.setTimeout(210000)

// Set the action timeout to 10 seconds to quickly identify failing actions.
// By default Playwright Test has no timeout for actions (e.g. clicking an element).
test.use({ actionTimeout: 10000 })

/**
 * Use a test to run our screenshot logic.
 *
 * @todo Fail the test if the screenshot url 404s.
 */
test('wait for the url to load and capture screenshots', async ({ page }) => {

  const url = process.env.SCREENSHOT_URL ?? '';
  test.skip( 0 === url.length ); // No urls found.

  const result = await captureAndUploadScreenshots({ page, url });
  expect(result?.success, 'Screenshots did not capture successfully').toBe(true);
})
