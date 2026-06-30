export function createStorageKey(contentType: string, filename: string, timestamp = Date.now()) {
  const folder = contentType.startsWith('image/')
    ? 'images'
    : contentType.startsWith('video/')
      ? 'lessons'
      : 'downloads'
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')

  return `${folder}/${timestamp}-${safeFilename}`
}
