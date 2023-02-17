import { FileInfo } from "./fileinfo";

export interface FolderInfo {
  name: string;
  files: FileInfo[];
  folders: FolderInfo[];
}
