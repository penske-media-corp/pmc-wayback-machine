import slackWebApi from '../slack-web-api';

/**
 * Channel id for `#brand-performance-dashboard-notifications`.
 *
 * @type {String}
 */
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

export const dynamic = 'force-dynamic';

/**
 * Trigger the GitHub Workflow responsible for capturing screenshots with
 * Checkly.
 *
 * @param {Request} request Request object.
 */
export async function POST(request) {
  try {
    const { prefix = '' } = await request.json();
    const link = `https://${process.env.NEXT_PUBLIC_URL}/#${prefix}`;
    const message = `<${link}|New Screenshots - ${prefix}!>`;

    const success = await slackWebApi.chat.postMessage({
      channel: SLACK_CHANNEL_ID,
      text: message,
    });

    return Response.json({ success });
  } catch(error) {
    return Response.json(
      { error: 'Something went wrong! Check the logs.' },
      { status: 403 }
    );
  }
}
