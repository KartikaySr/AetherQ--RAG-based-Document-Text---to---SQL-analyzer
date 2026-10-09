// Leaves room for multipart headers under Vercel’s 4.5 MB request limit.
export const MAX_UPLOAD_MB = 4;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
