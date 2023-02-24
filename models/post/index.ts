export interface CreateFolderPostmodel {
  location: string;
  folderName: string;
}

export type FileRating = 0 | 1 | 2 | 3 | 4 | 5;
export interface SetFileRatingPostmodel {
  filename: string;
  rating: FileRating;
}
