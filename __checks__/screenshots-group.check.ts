import * as path from 'path';
import { BrowserCheck, CheckGroup } from 'checkly/constructs';

/**
 * Screenshots group.
 */
export const pmcWaybackMachineGroup = new CheckGroup( 'groups-pmc-wayback-machine', {
  name: 'PMC Wayback Machine',
  tags: [ 'screenshots', 'pmc-wayback-machine' ],
  environmentVariables: [],
  activated: true,
  locations: [ 'us-east-1', 'eu-west-1' ],
  concurrency: 100,
} );

/**
 * Create a "catch-all" check that can be used via CLI to test any URL.
 * @type {[type]}
 */
new BrowserCheck('screenshot-generic', {
  name: `Catch-All: Screenshot any URL via CLI`,
  locations: ['us-east-1', 'eu-west-1'],
  group: pmcWaybackMachineGroup,
  code: {
    entrypoint: path.join(process.cwd(), '__checks__', 'screenshots-test.spec.ts'),
  },
});

/**
 * Temporary list of urls copied from the yml.
 *
 * @todo Do we want to read the yml file or update it to use JSON?
 *
 * @type {Array}
 */
const urls = [
  'https://variety.com',
  'https://variety.com/2024/tv/entertainers/snl-marcello-hernandez-dave-chappelle-saturday-night-live-1236096469/',
  'https://variety.com/v/film/',
  'https://variety.com/search/?q=marvel',
  'https://variety.com/author/michael-schneider/',
  'https://footwearnews.com',
  'https://footwearnews.com/2023/shop/best-sneakers-for-men-1203435445/',
  'https://footwearnews.com/category/focus/athletic-outdoor/',
  'https://footwearnews.com/brand/nike/',
  'https://footwearnews.com/2023/business/earnings/nike-q3-earnings-2023-1203437116/',
];

/**
 * Create a Checkly BrowserCheck for each url.
 */
for (const url of urls) {
  const cleanedUrl = url
    .replace('https://', '') // Remove protocol.
    .replace('http://', '') // Remove protocol.
    .replace(/[^a-zA-Z0-9]/g, '_'); // Replace unsupported characters.

  new BrowserCheck(`screenshot-${cleanedUrl}`, {
    name: `Screenshot: ${cleanedUrl}`,
    locations: ['us-east-1', 'eu-west-1'],
    group: pmcWaybackMachineGroup,
    environmentVariables: [
      { key: 'SCREENSHOT_URL', value: url },
    ],
    code: {
      entrypoint: path.join(process.cwd(), '__checks__', 'screenshots-test.spec.ts'),
    },
  });
}
