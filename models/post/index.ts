export interface CreateFolderPostmodel {
  location: string;
  folderName: string;
}

export type FileRating = 0 | 1 | 2 | 3 | 4 | 5;
export interface SetFileRatingPostmodel {
  path: string;
  filename: string;
  rating: FileRating;
}
