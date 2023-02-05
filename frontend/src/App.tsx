import "./App.scss";
import styles from "./Tabs.module.scss";
import Upload from "./Upload/Upload";
import FileList from "./FileList/FileList";
import { Fragment, useEffect, useState } from "react";
import { FileInfo } from "../../models/fileinfo";
import { Tab } from "@headlessui/react";
import Paper from "./Paper/Paper";

function App() {
  const [files, setFiles] = useState<FileInfo[]>([]);

  const url = import.meta.env.DEV
    ? window.location.href.replace("5173", "4004")
    : window.location.href;

  const fetchFiles = () => {
    fetch(url + "files")
      .then((data) => data.json())
      .then((files) => setFiles(files));
  };
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <Tab.Group
      onChange={(index) => {
        if (index === 0) {
          fetchFiles();
        }
      }}
    >
      <Tab.List className={styles.tabList}>
        <Tab as={Fragment}>
          {({ selected }) => (
            <button className={selected ? styles.selected : ""}>Files</button>
          )}
        </Tab>
        <Tab as={Fragment}>
          {({ selected }) => (
            <button className={selected ? styles.selected : ""}>Upload</button>
          )}
        </Tab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>
          <Paper>
            <FileList files={files} />
          </Paper>
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
