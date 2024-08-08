import { WebClient } from '@slack/web-api';

const web = new WebClient(process.env.SLACK_TOKEN ?? '');

export default web;
