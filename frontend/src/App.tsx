import "./App.scss";
import styles from "./Tabs.module.scss";
import Upload from "./Upload/Upload";
import { Fragment } from "react";
import { FilesResponse } from "../../models/response";
import { Tab } from "@headlessui/react";
import Paper from "./Paper/Paper";
import { useQuery, useQueryClient } from "react-query";
import cx from "classnames";
import Files from "./Files/Files";

const dateReviver = (key: string, value: any) => {
  if (key === "dateAdded" && Date.parse(value)) {
    return new Date(value);
  }

  return value;
};

function App() {
  const queryClient = useQueryClient();

  const url = import.meta.env.DEV
    ? window.location.href.replace("5173", "4004")
    : window.location.href;

  const { data, isFetched } = useQuery(
    ["files"],
    async () => {
      const response = await fetch(url + "files");
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
              <Files data={data} />
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
