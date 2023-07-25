import { FileInfo } from "@models/fileinfo";
import { FolderInfo } from "@models/folderInfo";

export const getRenameValidator = (
  currentName: string,
  files?: FileInfo[],
  folders?: FolderInfo[]
) => {
  return (
    name: string
  ): {
    isValid: boolean;
    reason?: string | undefined;
  } => {
    if (name === "") {
      return {
        isValid: false,
        reason: "Please enter a name.",
      };
    }

    if (currentName === name) {
      return {
        isValid: false,
        reason: "Please enter a different name.",
      };
    }

    if (
      files?.some((x) => x.filename === name) ||
      folders?.some((x) => x.name === name)
    ) {
      return {
        isValid: false,
        reason:
          "A file or folder with that name already exists in this folder. Please enter a different name.",
      };
    }

    return { isValid: true };
  };
};
