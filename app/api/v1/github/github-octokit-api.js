import { Octokit } from '@octokit/core';

// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN ?? '',
});

export default octokit;
