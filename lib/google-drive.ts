import { google, drive_v3 } from "googleapis";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  owners?: { displayName: string; emailAddress: string }[];
  parents?: string[];
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface DriveFolder extends DriveFile {
  fileCount?: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Membuat instance Google Auth menggunakan Service Account.
 * Credential diambil dari environment variables.
 */
function createAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !privateKey) {
    throw new Error(
      "Missing Google Service Account credentials. " +
        "Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local"
    );
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

/**
 * Membuat instance Google Drive client yang ter-autentikasi.
 */
export async function getDriveClient(): Promise<drive_v3.Drive> {
  const auth = createAuth();
  const authClient = await auth.getClient();
  return google.drive({ version: "v3", auth: authClient as Parameters<typeof google.drive>[0]["auth"] });
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const FILE_FIELDS =
  "id, name, mimeType, owners, parents, size, modifiedTime, webViewLink, iconLink";

const FOLDER_MIME = "application/vnd.google-apps.folder";

// ─── Folders ──────────────────────────────────────────────────────────────────

/**
 * Mengambil daftar folder dari Drive.
 * Jika GOOGLE_DRIVE_FOLDER_ID disetel, hanya folder di dalam root tersebut yang diambil.
 * @param maxResults - Jumlah maksimal hasil (default 20)
 */
export async function listFolders(maxResults = 20): Promise<DriveFolder[]> {
  const drive = await getDriveClient();
  const parentId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  let q = `mimeType='${FOLDER_MIME}' and trashed=false`;
  if (parentId) {
    q += ` and '${parentId}' in parents`;
  }

  const res = await drive.files.list({
    q,
    pageSize: maxResults,
    fields: `files(${FILE_FIELDS})`,
    orderBy: "name",
  });

  const folders = (res.data.files ?? []) as DriveFolder[];

  // Untuk setiap folder, hitung jumlah file di dalamnya
  const foldersWithCount = await Promise.all(
    folders.map(async (folder) => {
      try {
        const countRes = await drive.files.list({
          q: `'${folder.id}' in parents and trashed=false`,
          fields: "files(id)",
        });
        return {
          ...folder,
          fileCount: countRes.data.files?.length ?? 0,
        };
      } catch {
        return { ...folder, fileCount: 0 };
      }
    })
  );

  return foldersWithCount;
}

// ─── Files ────────────────────────────────────────────────────────────────────

/**
 * Mengambil daftar file (bukan folder) dari Drive.
 * @param maxResults - Jumlah maksimal hasil (default 50)
 * @param folderId   - Filter berdasarkan folder tertentu (opsional)
 */
export async function listFiles(
  maxResults = 50,
  folderId?: string
): Promise<DriveFile[]> {
  const drive = await getDriveClient();
  const parentId = folderId ?? process.env.GOOGLE_DRIVE_FOLDER_ID;

  let q = `mimeType!='${FOLDER_MIME}' and trashed=false`;
  if (parentId) {
    q += ` and '${parentId}' in parents`;
  }

  const res = await drive.files.list({
    q,
    pageSize: maxResults,
    fields: `files(${FILE_FIELDS})`,
    orderBy: "modifiedTime desc",
  });

  return (res.data.files ?? []) as DriveFile[];
}

/**
 * Mengambil file yang baru-baru ini dimodifikasi.
 * @param maxResults - Jumlah maksimal hasil (default 8)
 */
export async function listRecentFiles(maxResults = 8): Promise<DriveFile[]> {
  const drive = await getDriveClient();

  const q = `mimeType!='${FOLDER_MIME}' and trashed=false`;

  const res = await drive.files.list({
    q,
    pageSize: maxResults,
    fields: `files(${FILE_FIELDS})`,
    orderBy: "modifiedTime desc",
  });

  return (res.data.files ?? []) as DriveFile[];
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Upload file ke Google Drive.
 * @param name      - Nama file
 * @param mimeType  - MIME type file
 * @param body      - Konten file (Readable stream atau Buffer)
 * @param folderId  - ID folder tujuan (default: GOOGLE_DRIVE_FOLDER_ID dari env)
 */
export async function uploadFile(
  name: string,
  mimeType: string,
  body: NodeJS.ReadableStream | Buffer,
  folderId?: string
): Promise<DriveFile> {
  const drive = await getDriveClient();
  const parentId = folderId ?? process.env.GOOGLE_DRIVE_FOLDER_ID;

  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType,
      parents: parentId ? [parentId] : undefined,
    },
    media: {
      mimeType,
      body,
    },
    fields: FILE_FIELDS,
  });

  return res.data as DriveFile;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Menghapus file/folder dari Drive (pindah ke Trash).
 * @param fileId - ID file/folder yang akan dihapus
 */
export async function deleteFile(fileId: string): Promise<void> {
  const drive = await getDriveClient();
  await drive.files.delete({ fileId });
}

// ─── Create Folder ────────────────────────────────────────────────────────────

/**
 * Membuat folder baru di Google Drive.
 * @param name     - Nama folder baru
 * @param parentId - ID folder parent (default: GOOGLE_DRIVE_FOLDER_ID dari env)
 */
export async function createFolder(
  name: string,
  parentId?: string
): Promise<DriveFile> {
  const drive = await getDriveClient();
  const parent = parentId ?? process.env.GOOGLE_DRIVE_FOLDER_ID;

  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: FOLDER_MIME,
      parents: parent ? [parent] : undefined,
    },
    fields: FILE_FIELDS,
  });

  return res.data as DriveFile;
}

// ─── Rename ───────────────────────────────────────────────────────────────────

/**
 * Mengubah nama file/folder di Google Drive.
 * @param fileId  - ID file/folder
 * @param newName - Nama baru
 */
export async function renameFile(
  fileId: string,
  newName: string
): Promise<DriveFile> {
  const drive = await getDriveClient();

  const res = await drive.files.update({
    fileId,
    requestBody: { name: newName },
    fields: FILE_FIELDS,
  });

  return res.data as DriveFile;
}
