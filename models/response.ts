import { Orientation } from "./fileinfo";
import { FolderInfo } from "./folderInfo";

export interface FilesResponse {
  freeSpace: number;
  contents: FolderInfo;
}

export interface ImageInfoResponse {
  dimensions: {
    width: number;
    height: number;
  };
  orientation: Orientation;
}

export interface DiskSpaceResponse {
  freeSpace: number;
  size: number;
}
