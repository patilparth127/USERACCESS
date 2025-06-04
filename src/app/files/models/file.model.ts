export interface FileRecord {
  id?: number;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date | string;
  description?: string;
  category?: string;
  content: string; // base64 encoded content
}
