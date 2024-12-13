import { FileInfo } from "@models/fileinfo";
import { FolderInfo } from "@models/folderInfo";
import { CreateFilePostmodel } from "@root/../../features/files/create/createFilePostmodel";
import { DeletePostmodel } from "@root/../../features/files/delete/deleteFilePostmodel";
import { MoveFilesPostModel } from "@root/../../features/files/move/moveFilesPostModel";
import { RenamePostModel } from "@root/../../features/files/rename/renameFilePostmodel";
import { CreateFolderPostmodel } from "@root/../../features/folders/create/createFolderPostmodel";
import { DeleteFolderPostmodel } from "@root/../../features/folders/delete/deleteFolderPostmodel";
import axios, { AxiosResponse } from "axios";
import { QueryClient, useMutation, UseMutationResult } from "react-query";
import { Toggleable } from "./useToggle";

type NullableSetter<T> = (value: T | null) => void;
type Mutation<TData, TVar> = UseMutationResult<TData, unknown, TVar, unknown>;
type AxiosMutation<T> = Mutation<AxiosResponse<any, any>, T>;

export interface Mutations {
  folders: {
    create: UseMutationResult<any, unknown, CreateFolderPostmodel, unknown>;
    delete: AxiosMutation<DeleteFolderPostmodel>;
    rename: AxiosMutation<RenamePostModel>;
  };

  files: {
    create: UseMutationResult<void, unknown, CreateFilePostmodel, unknown>;
    move: Mutation<void, MoveFilesPostModel>;
    rename: Mutation<void, RenamePostModel>;
    delete: Mutation<void, DeletePostmodel>;
  };
}

export const useMutations = (
  queryClient: QueryClient,
  baseUrl: string,
  activeFolder: string,
  setFocusedFile: NullableSetter<FileInfo>,
  setFocusedFolder: NullableSetter<FolderInfo>,
  setSelectMode: (value: "single" | "multiple") => void,
  setAllSelected: (value: boolean) => void,
  createFolderDialog: Toggleable,
  showNewFileDialog: Toggleable,
  showMoveDialog: Toggleable,
  showRenameDialog: Toggleable,
  showDeleteDialog: Toggleable
) => {
  return {
    folders: {
      create: useMutation(
        async (postmodel: CreateFolderPostmodel) => {
          const url = baseUrl + "folders/create";
          return (await axios.post(url, postmodel)).data;
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["files", activeFolder]);
            queryClient.invalidateQueries(["folders"]);
            createFolderDialog.set(false);
          },
        }
      ),
      delete: useMutation(
        async (postmodel: DeleteFolderPostmodel) => {
          const url = baseUrl + "folders/delete";
          return await axios.post(url, postmodel);
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["files", activeFolder]);
            queryClient.invalidateQueries(["folders"]);

            setFocusedFolder(null);
          },
        }
      ),
      rename: useMutation(
        async (postmodel: RenamePostModel) => {
          const url = baseUrl + "folders/rename";
          return await axios.post(url, postmodel);
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["files", activeFolder]);
            queryClient.invalidateQueries(["folders"]);
          },
        }
      ),
    },
    files: {
      create: useMutation(
        async (postmodel: CreateFilePostmodel) => {
          await axios.post(baseUrl + "files/create", postmodel);
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["files", activeFolder]);
            showNewFileDialog.set(false);
          },
        }
      ),
      move: useMutation(
        async (postmodel: MoveFilesPostModel) => {
          const url = baseUrl + "files/move";
          await axios.post(url, postmodel);
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["files", activeFolder]);
            queryClient.invalidateQueries(["folders"]);

            showMoveDialog.set(false);
            setSelectMode("single");
            setFocusedFile(null);
          },
        }
      ),
      rename: useMutation(
        async (postmodel: RenamePostModel) => {
          const url = baseUrl + "files/rename";
          await axios.post(url, postmodel);
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["files", activeFolder]);

            showRenameDialog.set(false);
            setFocusedFile(null);
          },
        }
      ),
      delete: useMutation(
        async (postmodel: DeletePostmodel) => {
          const url = baseUrl + "files/delete";
          await axios.post(url, postmodel);
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["files", activeFolder]);

            showDeleteDialog.set(false);
            setFocusedFile(null);
            setAllSelected(false);
          },
        }
      ),
    },
  };
};
