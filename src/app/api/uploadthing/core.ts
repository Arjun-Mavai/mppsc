import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { verifyAuth } from '@/lib/auth';

const f = createUploadthing();

export const ourFileRouter = {
  adminImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await verifyAuth();
      if (!user || user.role !== 'admin') {
        throw new UploadThingError('Only admins can upload images.');
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        userId: metadata.userId,
        url: file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
