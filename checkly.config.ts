import { defineConfig } from 'checkly';
import { BrowserCheck, Frequency } from 'checkly/constructs';

export default defineConfig({
  projectName: 'PMC Wayback Machine',
  logicalId: 'pmc-wayback-machine',
  repoUrl: 'https://github.com/penske-media-corp/pmc-wayback-machine',
  checks: {
    activated: true,
    muted: false,
    runtimeId: '2024.02',
    frequency: Frequency.EVERY_24H,
    locations: [ 'us-east-1', 'eu-west-1' ],
    checkMatch: '__checks__/**.check.ts',
  },
  cli: {
    runLocation: 'eu-west-1',
  },
});
