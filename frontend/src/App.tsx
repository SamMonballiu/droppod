import app from "./App.module.scss";
import styles from "./Tabs.module.scss";
import Upload from "./Upload/Upload";
import React, { useEffect, useState } from "react";
import { FilesResponse } from "../../models/response";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Files from "./Files/Files";
import Breadcrumbs from "./Breadcrumbs/Breadcrumbs";
import { CreateFolderPostmodel } from "../../models/post";
import { GoFileDirectory } from "react-icons/go";
import useToggle from "./hooks/useToggle";
import CreateFolderDialog from "./CreateFolderDialog/CreateFolderDialog";
import axios from "axios";
import { GoFileSubmodule, GoCloudUpload } from "react-icons/go";
import Paper from "./Paper/Paper";
import cx from "classnames";
import { FolderInfo } from "../../models/folderInfo";
import FolderList from "./FolderList/FolderList";

const dateReviver = (key: string, value: any) => {
  if (key === "dateAdded" && Date.parse(value)) {
    return new Date(value);
  }

  return value;
};

enum Tabs {
  Files = 0,
  Upload = 1,
}

export type View = "list" | "grid" | "gallery";

function App() {
  const [activeFolder, setActiveFolder] = useState("");
  const [view, setView] = useState<View>("list");
  const [activeTab, setActiveTab] = useState<number>(0);
  const queryClient = useQueryClient();
  const createFolderDialog = useToggle(false);

  const baseUrl = import.meta.env.DEV
    ? window.location.href.replace("5173", "4004")
    : window.location.href;

  const { data, isFetched } = useQuery(
    ["files", activeFolder],
    async () => {
      let url = baseUrl + "files";
      if (activeFolder !== "") {
        url += `?folder=${activeFolder}`;
      }

      return (
        await axios.get<FilesResponse>(url, {
          transformResponse: (data) => JSON.parse(data, dateReviver),
        })
      ).data;
    },
    {
      staleTime: Infinity,
    }
  );

  const { data: folderList, isFetched: hasFetchedFolders } = useQuery(
    ["folders"],
    async () => {
      let url = baseUrl + "folders";
      return (await axios.get<FolderInfo>(url)).data;
    }
  );

  const mutations = {
    folders: {
      create: useMutation(
        async (postmodel: CreateFolderPostmodel) => {
          const url = baseUrl + "folders/create";
          return (await axios.post(url, postmodel)).data;
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["files", activeFolder]);
            createFolderDialog.set(false);
          },
        }
      ),
    },
  };

  const onCreateFolder = async (folderName: string) => {
    const postmodel: CreateFolderPostmodel = {
      location: activeFolder,
      folderName,
    };

    return await mutations.folders.create.mutateAsync(postmodel);
  };

  const breadcrumbs = (
    <div className={app.breadcrumbs}>
      <Breadcrumbs
        path={activeFolder}
        onClick={setActiveFolder}
        isReadOnly={activeTab === Tabs.Upload}
      />
      {activeTab !== Tabs.Upload && (
        <div className={app.button} onClick={createFolderDialog.toggle}>
          <GoFileDirectory />
        </div>
      )}
    </div>
  );

  const handleCreateFolder = async (folderName: string) => {
    return await onCreateFolder(folderName);
  };

  const handleSelectFolder = (folderName: string) => {
    setActiveFolder(folderName === "" ? "" : "/" + folderName);
  };

  const content =
    activeTab == 0 ? (
      <div className={styles.contentX}>
        {breadcrumbs}
        <div className={styles.foldersFiles}>
          <section>
            {hasFetchedFolders && (
              <FolderList
                onSelect={handleSelectFolder}
                data={folderList!}
                activeFolder={activeFolder}
                isExpanded={(folderName) =>
                  activeFolder !== "" && activeFolder.includes(folderName)
                }
              />
            )}
          </section>

          <section>
            {isFetched ? (
              <Files
                data={data!}
                onSelectFolder={setActiveFolder}
                view={view}
                setView={setView}
              />
            ) : (
              <p>Fetching...</p>
            )}
          </section>
        </div>
      </div>
    ) : (
      <>
        {breadcrumbs}
        <Upload baseUrl={baseUrl} folder={activeFolder} />
      </>
    );

  const tabs = (
    <>
      <GoFileSubmodule
        className={cx({ [styles.active]: activeTab === 0 })}
        onClick={() => setActiveTab(0)}
      />
      <GoCloudUpload
        className={cx({ [styles.active]: activeTab === 1 })}
        onClick={() => setActiveTab(1)}
      />
    </>
  );

  return (
    <>
      {createFolderDialog.value && (
        <CreateFolderDialog
          onClose={createFolderDialog.toggle}
          onSubmit={handleCreateFolder}
        />
      )}
      <div className={styles.container}>
        <div className={cx(styles.tabs, styles.vertical)}>{tabs}</div>
        <div className={cx(styles.tabs, styles.horizontal)}>{tabs}</div>
        <div className={styles.content}>{content}</div>
      </div>
    </>
  );
}

export default App;
