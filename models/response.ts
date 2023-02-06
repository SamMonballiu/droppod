import { FileInfo } from "./fileinfo";

export interface FilesResponse {
  freeSpace: number;
  files: FileInfo[];
}
