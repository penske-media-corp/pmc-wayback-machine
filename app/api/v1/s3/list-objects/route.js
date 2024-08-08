import s3Client from '../s3-client';
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export const dynamic = 'force-dynamic';

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
