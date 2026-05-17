export const getCloudinaryPublicId = (url: string) => {
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  // remove version and extension
  const afterUpload = parts[1];
  const withoutVersion = afterUpload.replace(/^v\d+\//, "");
  const publicId = withoutVersion.replace(/\.[^/.]+$/, ""); 
  return publicId;
}