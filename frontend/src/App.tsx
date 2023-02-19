import app from "./App.module.scss";
import styles from "./Tabs.module.scss";
import Upload from "./Upload/Upload";
import React, { Fragment, useState } from "react";
import { FilesResponse } from "../../models/response";
import { Tab } from "@headlessui/react";
import Paper from "./Paper/Paper";
import { useMutation, useQuery, useQueryClient } from "react-query";
import cx from "classnames";
import Files from "./Files/Files";
import Breadcrumbs from "./Breadcrumbs/Breadcrumbs";
import { CreateFolderPostmodel } from "../../models/post";
import { GoFileDirectory } from "react-icons/go";
import useToggle from "./hooks/useToggle";
import CreateFolderDialog from "./CreateFolderDialog/CreateFolderDialog";

const dateReviver = (key: string, value: any) => {
  if (key === "dateAdded" && Date.parse(value)) {
    return new Date(value);
  }

  return value;
};

function App() {
  const [activeFolder, setActiveFolder] = useState("");
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

      const response = await fetch(url);
      const text = await response.text();
      return JSON.parse(text, dateReviver) as FilesResponse;
    },
    {
      staleTime: Infinity,
    }
  );

  const mutations = {
    folders: {
      create: useMutation(
        async (postmodel: CreateFolderPostmodel) => {
          const url = baseUrl + "folders/create";
          return await fetch(url, {
            method: "POST",
            body: JSON.stringify(postmodel),
            headers: {
              "Content-Type": "application/json",
            },
          });
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["files", activeFolder]);
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
      <Breadcrumbs path={activeFolder} onClick={setActiveFolder} />
      <div className={app.button} onClick={createFolderDialog.toggle}>
        <GoFileDirectory />
      </div>
    </div>
  );

  const handleCreateFolder = async (folderName: string) => {
    return await onCreateFolder(folderName);
  };

  return (
    <>
      {createFolderDialog.value && (
        <CreateFolderDialog
          onClose={createFolderDialog.toggle}
          onSubmit={handleCreateFolder}
        />
      )}
      <Tab.Group
        onChange={(index) => {
          if (index === 0) {
            queryClient.invalidateQueries(["files", activeFolder]);
          }
        }}
      >
        <Tab.List className={styles.tabList}>
          <Tab as={Fragment}>
            {({ selected }) => (
              <span className={cx({ [styles.selected]: selected })}>Files</span>
            )}
          </Tab>
          <Tab as={Fragment}>
            {({ selected }) => (
              <span className={cx({ [styles.selected]: selected })}>
                Upload
              </span>
            )}
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            {isFetched ? (
              <Paper>
                {breadcrumbs}
                <Files
                  data={data!}
                  onSelectFolder={setActiveFolder}
                  onCreateFolder={onCreateFolder}
                />
              </Paper>
            ) : (
              <Paper>
                {breadcrumbs}
                <p>Fetching...</p>
              </Paper>
            )}
          </Tab.Panel>
          <Tab.Panel>
            <Paper>
              {breadcrumbs}
              <Upload baseUrl={baseUrl} folder={activeFolder} />
            </Paper>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </>
  );
}

export default App;
