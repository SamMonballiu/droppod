import { FileInfo } from "./fileinfo";

export interface FolderInfo {
  name: string;
  parent: string;
  files: FileInfo[];
  folders: FolderInfo[];
}
