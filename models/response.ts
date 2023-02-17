import { FolderInfo } from "./folderInfo";

export interface FilesResponse {
  freeSpace: number;
  contents: FolderInfo;
}
