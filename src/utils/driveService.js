const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_API_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const DB_FILE_NAME = 'toko-klontong-db.json';

// Find the file in the user's Drive. Since we use drive.file scope, 
// we only see files created by this specific app.
export async function findBackupFile(accessToken) {
  const query = encodeURIComponent(`name='${DB_FILE_NAME}' and trashed=false`);
  const response = await fetch(`${DRIVE_API_URL}?q=${query}&spaces=drive`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  if (!response.ok) throw new Error('Failed to search Drive');
  
  const data = await response.json();
  return data.files && data.files.length > 0 ? data.files[0] : null;
}

// Download the actual JSON content of the file
export async function downloadBackupFile(accessToken, fileId) {
  const response = await fetch(`${DRIVE_API_URL}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  if (!response.ok) throw new Error('Failed to download from Drive');
  
  return await response.json();
}

// Create a new JSON file in Drive
export async function createBackupFile(accessToken, fileData) {
  const metadata = {
    name: DB_FILE_NAME,
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([JSON.stringify(fileData)], { type: 'application/json' }));

  const response = await fetch(`${UPLOAD_API_URL}?uploadType=multipart`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form
  });

  if (!response.ok) throw new Error('Failed to create file in Drive');
  return await response.json();
}

// Update the existing JSON file in Drive
export async function updateBackupFile(accessToken, fileId, fileData) {
  const response = await fetch(`${UPLOAD_API_URL}/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(fileData)
  });

  if (!response.ok) throw new Error('Failed to update file in Drive');
  return await response.json();
}

// Full Sync logic (Uploads local data to drive, creating file if needed)
export async function syncToDrive(accessToken, data) {
  try {
    const file = await findBackupFile(accessToken);
    if (file) {
      await updateBackupFile(accessToken, file.id, data);
    } else {
      await createBackupFile(accessToken, data);
    }
  } catch (error) {
    console.error("Error syncing to Drive:", error);
    throw error;
  }
}
