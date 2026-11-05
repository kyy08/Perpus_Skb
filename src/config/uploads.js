import fs from 'node:fs';
import path from 'node:path';

export const uploadDirectory = path.resolve(process.cwd(), 'uploads');

fs.mkdirSync(uploadDirectory, { recursive: true });

export async function removeUploadedFile(fileUrl) {
  if (!fileUrl) return;

  let fileName;
  try {
    const parsedUrl = new URL(fileUrl);
    if (!parsedUrl.pathname.startsWith('/uploads/')) return;
    fileName = path.basename(parsedUrl.pathname);
  } catch {
    fileName = path.basename(fileUrl);
  }

  if (!fileName.startsWith('cover-')) return;
  await fs.promises.rm(path.join(uploadDirectory, fileName), { force: true });
}
