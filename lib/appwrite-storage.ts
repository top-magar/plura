import "server-only";

import { Client, Storage, ID } from "node-appwrite";

function createStorageClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

  return new Storage(client);
}

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

export async function uploadFile(file: File): Promise<string> {
  const storage = createStorageClient();
  const result = await storage.createFile(BUCKET_ID, ID.unique(), file);
  return getFileUrl(result.$id);
}

export function getFileUrl(fileId: string): string {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
}

export async function deleteFile(fileId: string): Promise<void> {
  const storage = createStorageClient();
  await storage.deleteFile(BUCKET_ID, fileId);
}
