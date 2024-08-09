import githubOctokitApi from '../github-octokit-api';

export const dynamic = 'force-dynamic';

/**
 * Trigger the GitHub Workflow responsible for capturing screenshots with
 * Checkly.
 *
 * @param {Request} request Request object.
 */
export async function POST(request) {
  const { url = '' } = await request.json();
  try {
    new URL(url); // Throws an error if not a url.
  } catch (error) {
    return Response.json(
      { error },
      { status: 403 }
    );
  }

  // @todo Abstract this for open sourcing.
  try {
    const response = await githubOctokitApi.request(
      'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
      {
        owner: 'penske-media-corp',
        repo: 'pmc-wayback-machine',
        workflow_id: 'capture-url.yml',
        ref: 'main',
        inputs: {
          url,
        },
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    return Response.json({response});
  } catch (error) {
    return Response.json(
      {error},
      { status: 403 }
    );
  }
}
