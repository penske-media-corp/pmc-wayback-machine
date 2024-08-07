import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export const dynamic = 'force-dynamic';

/**
 * S3 client.
 *
 * @type {S3Client}
 */
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Proxy the S3 request to our server to avoid exposing secrets.
 *
 * @param {Request} request Request object.
 */
export async function GET(request) {
  const searchParams = request?.nextUrl?.searchParams ?? {};

  try {
    const result = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.BUCKET_NAME,
        Prefix: searchParams.get('prefix') ?? '',
        Delimiter: '/',
      })
    );

    return Response.json(result);
  } catch (exception) {
    return Response.json(
      exception,
      {
        status: exception?.['$metadata']?.httpStatusCode ?? 403
      }
    );
  }
}
