import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { ALLOWED_IMAGE_TYPES, BLOB_PATH_PREFIX, MAX_UPLOAD_BYTES } from '@/lib/dog-photo';

/**
 * Mints short-lived Vercel Blob upload tokens for the Good Dog Library form.
 *
 * The browser uploads the original photo straight to Blob storage using the
 * token this route returns, which keeps the file out of the serverless request
 * body (Vercel caps that around 4.5MB, well under a modern phone photo).
 *
 * This endpoint is unauthenticated, so onBeforeGenerateToken is the only thing
 * standing between it and someone using the store as free file hosting. Every
 * constraint below is load-bearing.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        // The pathname comes from the client, so confine writes to our prefix.
        if (!pathname.startsWith(BLOB_PATH_PREFIX)) {
          throw new Error('Uploads are only permitted under the dog-photos prefix.');
        }

        return {
          allowedContentTypes: ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          // Never let one submission overwrite another.
          addRandomSuffix: true,
        };
      },
      // onUploadCompleted is deliberately omitted. It is invoked by Vercel's
      // servers calling back into the deployment, so it never fires on
      // localhost. The notify route (/api/dog-photo) sends the email instead,
      // which behaves identically in dev and production.
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Blob upload token error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Could not start the upload.' },
      { status: 400 },
    );
  }
}
