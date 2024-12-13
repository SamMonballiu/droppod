import { Mutations } from "@hooks/useMutations";
import { FileInfo } from "@models/fileinfo";
import { FolderInfo } from "@models/folderInfo";
import { DeletePostmodel } from "../../features/files/delete/deleteFilePostmodel";
import { MoveFilesPostModel } from "../../features/files/move/moveFilesPostModel";
import { RenamePostModel } from "../../features/files/rename/renameFilePostmodel";
import { CreateFolderPostmodel } from "../../features/folders/create/createFolderPostmodel";
import { DeleteFolderPostmodel } from "../../features/folders/delete/deleteFolderPostmodel";

export const useApp = (
  mutations: Mutations,
  activeFolder: string,
  selectMode: "single" | "multiple",
  focusedFile: FileInfo | null,
  focusedFolder: FolderInfo | null,
  selectedFiles: string[]
) => {
  const onCreateFolder = async (folderName: string) => {
    const postmodel: CreateFolderPostmodel = {
      location: activeFolder,
      folderName,
    };

    return await mutations.folders.create.mutateAsync(postmodel);
  };

  const handleMoveFiles = async (destination: string) => {
    const postmodel: MoveFilesPostModel = {
      location: activeFolder,
      destination,
      filenames:
        selectMode === "multiple"
          ? selectedFiles
          : [focusedFile?.filename ?? ""],
    };

    return await mutations.files.move.mutateAsync(postmodel);
  };

  const handleRename = async (newName: string) => {
    const postmodel: RenamePostModel = {
      path: activeFolder,
      currentName: focusedFile!.filename,
      newName,
    };

    return await mutations.files.rename.mutateAsync(postmodel);
  };

  const handleRenameFolder = async (newName: string) => {
    const postmodel: RenamePostModel = {
      path: activeFolder,
      currentName: focusedFolder!.name,
      newName,
    };

    return await mutations.folders.rename.mutateAsync(postmodel);
  };

  const handleDelete = async (names: string[]) => {
    const postmodel: DeletePostmodel = {
      path: activeFolder,
      names,
    };

    return await mutations.files.delete.mutateAsync(postmodel);
  };

  const handleDeleteFolder = async (folderName: string) => {
    const postmodel: DeleteFolderPostmodel = {
      parentPath: activeFolder,
      folderName,
    };

    return await mutations.folders.delete.mutateAsync(postmodel);
  };

  const handleCreateFile = async (filename: string, contents: string) =>
    await mutations.files.create.mutateAsync({
      location: activeFolder,
      filename,
      contents,
    });

  return {
    handle: {
      folder: {
        create: onCreateFolder,
        delete: handleDeleteFolder,
        rename: handleRenameFolder,
      },
      file: {
        create: handleCreateFile,
        move: handleMoveFiles,
        rename: handleRename,
        delete: handleDelete,
      },
    },
  };
};
