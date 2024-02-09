import { FileRatingValue } from "../../../models/fileinfo";

export interface SetFileRatingPostmodel {
  path: string;
  filename: string;
  rating: FileRatingValue;
}
