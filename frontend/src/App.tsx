import "./App.scss";
import styles from "./Tabs.module.scss";
import Upload from "./Upload/Upload";
import FileList from "./FileList/FileList";
import { Fragment, useEffect, useState } from "react";
import { FileInfo } from "../../models/fileinfo";
import { Tab } from "@headlessui/react";
import Paper from "./Paper/Paper";
import { useQuery, useQueryClient } from "react-query";
import cx from "classnames";

function App() {
  const queryClient = useQueryClient();

  const url = import.meta.env.DEV
    ? window.location.href.replace("5173", "4004")
    : window.location.href;

  const { data, isFetched } = useQuery(
    ["files"],
    async () => {
      const response = await fetch(url + "files");
      return await response.json();
    },
    {
      staleTime: Infinity,
    }
  );

  return (
    <Tab.Group
      onChange={(index) => {
        if (index === 0) {
          queryClient.invalidateQueries(["files"]);
        }
      }}
    >
      <Tab.List className={styles.tabList}>
        <Tab as={Fragment}>
          {({ selected }) => (
            <button className={cx({ [styles.selected]: selected })}>
              Files
            </button>
          )}
        </Tab>
        <Tab as={Fragment}>
          {({ selected }) => (
            <button className={cx({ [styles.selected]: selected })}>
              Upload
            </button>
          )}
        </Tab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>
          {isFetched ? (
            <Paper>
              <FileList files={data as FileInfo[]} />
            </Paper>
          ) : (
            <p>Fetching...</p>
          )}
        </Tab.Panel>
        <Tab.Panel>
          <Paper>
            <Upload baseUrl={url} />
          </Paper>
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}

export default App;
