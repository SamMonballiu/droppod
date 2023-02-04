import "./App.scss";
import styles from "./Tabs.module.scss";
import Upload from "./Upload/Upload";
import FileList from "./FileList/FileList";
import { Fragment, useEffect, useState } from "react";
import { FileInfo } from "../../models/fileinfo";
import { Tab } from "@headlessui/react";

function App() {
  const [files, setFiles] = useState<FileInfo[]>([]);

  const url = import.meta.env.DEV
    ? window.location.href.replace("5173", "4004")
    : window.location.href;

  console.log(url);

  const fetchFiles = () => {
    fetch(url)
      .then((data) => data.json())
      .then((files) => setFiles(files));
  }
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <Tab.Group onChange={(index) => {
      console.log(index);
      if (index === 0) {
        fetchFiles();
      }
    } }>
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
          <FileList files={files} />
        </Tab.Panel>
        <Tab.Panel>
          <Upload baseUrl={url} />
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}

export default App;
