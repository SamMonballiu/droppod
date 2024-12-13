import { MoveFilesDialog, RenameDialog, DeleteDialog } from "@components";
import { Mutations, NullableSetter } from "@hooks/useMutations";
import useToggle, { Toggleable } from "@hooks/useToggle";
import { FileInfo } from "@models/fileinfo";
import { FolderInfo } from "@models/folderInfo";
import { FilesResponse } from "@models/response";
import React from "react";
import { DeletePostmodel } from "../../features/files/delete/deleteFilePostmodel";
import { MoveFilesPostModel } from "../../features/files/move/moveFilesPostModel";
import { RenamePostModel } from "../../features/files/rename/renameFilePostmodel";
import { CreateFolderPostmodel } from "../../features/folders/create/createFolderPostmodel";
import { DeleteFolderPostmodel } from "../../features/folders/delete/deleteFolderPostmodel";
import { getRenameValidator } from "./validators/rename";

export const useApp = (
  mutations: Mutations,
  activeFolder: string,
  selectMode: "single" | "multiple",
  focusedFile: FileInfo | null,
  focusedFolder: FolderInfo | null,
  selectedFiles: string[],
  setFocusedFile: NullableSetter<FileInfo>,
  setFocusedFolder: NullableSetter<FolderInfo>,
  data: FilesResponse | undefined,
  folderList: FolderInfo | undefined,
  createFolderDialog: Toggleable,
  showNewFileDialog: Toggleable,
  showMoveDialog: Toggleable,
  showRenameDialog: Toggleable,
  showDeleteDialog: Toggleable
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

  const handle = {
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
  };

  const moveFilesDialog = !folderList ? null : (
    <MoveFilesDialog
      isOpen={showMoveDialog.value}
      onClose={() => {
        showMoveDialog.toggle();
        setFocusedFile(null);
      }}
      data={folderList}
      activeFolder={activeFolder}
      files={
        selectMode === "multiple"
          ? selectedFiles
          : [focusedFile?.filename ?? ""]
      }
      onConfirm={handle.file.move}
      isMoving={mutations.files.move.isLoading}
    />
  );

  const renameFileDialog = focusedFile ? (
    <RenameDialog
      currentName={focusedFile!.filename}
      validateName={getRenameValidator(
        focusedFile!.filename,
        data?.contents.files,
        data?.contents.folders
      )}
      onConfirm={async (newName) => await handle.file.rename(newName)}
      isOpen={showRenameDialog.value}
      onClose={() => {
        showRenameDialog.toggle();
        setFocusedFile(null);
      }}
    />
  ) : null;

  const renameFolderDialog = focusedFolder ? (
    <RenameDialog
      currentName={focusedFolder!.name}
      validateName={getRenameValidator(
        focusedFolder!.name,
        data?.contents.files,
        data?.contents.folders
      )}
      onConfirm={async (newName) => await handle.folder.rename(newName)}
      isOpen={showRenameDialog.value}
      onClose={() => {
        showRenameDialog.set(false);
        setFocusedFolder(null);
      }}
    />
  ) : null;

  const deleteDialog = (
    <DeleteDialog
      isOpen={
        showDeleteDialog.value &&
        (focusedFile !== null || selectedFiles.length > 0)
      }
      onClose={() => {
        setFocusedFile(null);
        showDeleteDialog.toggle();
      }}
      names={focusedFile ? [focusedFile.filename] : selectedFiles}
      mode="file"
      onConfirm={handle.file.delete}
      isDeleting={mutations.files.delete.isLoading}
    />
  );

  const deleteFolderDialog = React.useMemo(() => {
    return focusedFolder === null ? null : (
      <DeleteDialog
        isOpen={showDeleteDialog.value && focusedFolder !== null}
        onClose={() => {
          setFocusedFolder(null);
          showDeleteDialog.toggle();
        }}
        names={[focusedFolder!.name]}
        mode="folder"
        onConfirm={(names) => handle.folder.delete(names[0])}
        isDeleting={mutations.folders.delete.isLoading}
      />
    );
  }, [focusedFolder]);

  const dialogs = {
    folder: {
      delete: deleteFolderDialog,
      rename: renameFolderDialog,
    },
    file: {
      delete: deleteDialog,
      move: moveFilesDialog,
      rename: renameFileDialog,
    },
  };

  const select = {
    file: {
      forRename: (file: FileInfo) => {
        showRenameDialog.set(true);
        setFocusedFile(file);
      },
      forMove: (file: FileInfo) => {
        showMoveDialog.set(true);
        setFocusedFile(file);
      },
      forDelete: (file: FileInfo) => {
        showDeleteDialog.set(true);
        setFocusedFile(file);
      },
    },
    folder: {
      forRename: (folder: FolderInfo) => {
        showRenameDialog.set(true);
        setFocusedFolder(folder);
      },
      forDelete: (folder: FolderInfo) => {
        showDeleteDialog.set(true);
        setFocusedFolder(folder);
      },
    },
  };

  return { handle, dialogs, select };
};
