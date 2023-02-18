import "./App.scss";
import styles from "./Tabs.module.scss";
import Upload from "./Upload/Upload";
import { Fragment, useState } from "react";
import { FilesResponse } from "../../models/response";
import { Tab } from "@headlessui/react";
import Paper from "./Paper/Paper";
import { useQuery, useQueryClient } from "react-query";
import cx from "classnames";
import Files from "./Files/Files";
import Breadcrumbs from "./Breadcrumbs/Breadcrumbs";

const dateReviver = (key: string, value: any) => {
  if (key === "dateAdded" && Date.parse(value)) {
    return new Date(value);
  }

  return value;
};

function App() {
  const [activeFolder, setActiveFolder] = useState("");
  const queryClient = useQueryClient();

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
            <span className={cx({ [styles.selected]: selected })}>Files</span>
          )}
        </Tab>
        <Tab as={Fragment}>
          {({ selected }) => (
            <span className={cx({ [styles.selected]: selected })}>Upload</span>
          )}
        </Tab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>
          {isFetched ? (
            <Paper>
              <Breadcrumbs path={activeFolder} onClick={setActiveFolder} />
              <Files data={data!} onSelectFolder={setActiveFolder} />
            </Paper>
          ) : (
            <Paper>
              <Breadcrumbs path={activeFolder} onClick={setActiveFolder} />
              <p>Fetching...</p>
            </Paper>
          )}
        </Tab.Panel>
        <Tab.Panel>
          <Paper>
            <Upload baseUrl={baseUrl} />
          </Paper>
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}

export default App;
