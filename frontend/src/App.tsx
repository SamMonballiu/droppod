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
import axios from "axios";

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

function App() {
  const [activeFolder, setActiveFolder] = useState("");
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
          setActiveTab(index);
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
                <Files data={data!} onSelectFolder={setActiveFolder} />
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
