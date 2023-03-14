import app from "./App.module.scss";
import tabStyles from "./Tabs.module.scss";
import Upload from "./Upload/Upload";
import React, { useEffect, useMemo, useState } from "react";
import { FilesResponse } from "../../models/response";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Files from "./Files/Files";
import Breadcrumbs from "./Breadcrumbs/Breadcrumbs";
import { CreateFolderPostmodel } from "../../models/post";
import useToggle from "./hooks/useToggle";
import CreateFolderDialog from "./CreateFolderDialog/CreateFolderDialog";
import axios from "axios";
import { GoFileSubmodule, GoCloudUpload } from "react-icons/go";
import cx from "classnames";
import { FolderInfo } from "../../models/folderInfo";
import FolderList from "./FolderList/FolderList";
import { sortBy, useSortedList } from "./hooks/useSortedList";
import FileSortOptions, { SortOption } from "./Files/FileSortOptions";
import { FileInfo, isImage } from "../../models/fileinfo";
import { TbTelescope } from "react-icons/tb";
import { FileGridZoom } from "./FileGrid/FileGrid";
import {
  MdOutlineListAlt,
  MdGridView,
  MdOutlinePhoto,
  MdOutlineCreateNewFolder,
} from "react-icons/md";

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
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [zoom, setZoom] = useState<FileGridZoom>(2);
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

  const { getSorted, sortProperty, isDescending, sort } = useSortedList(
    data?.contents.files ?? [],
    "dateAdded",
    true
  );

  const sortedFolders = useMemo(() => {
    if (!data || data.contents.folders.length === 0) {
      return [];
    }

    let sorted = data?.contents.folders;

    if (sortProperty === "dateAdded") {
      sorted = [...data?.contents.folders].sort((a, b) =>
        sortBy(a, b, "dateAdded")
      );
    }

    if (sortProperty === "filename") {
      sorted = [...data?.contents.folders].sort((a, b) => sortBy(a, b, "name"));
    }

    return isDescending && ["dateAdded", "filename"].includes(sortProperty!)
      ? sorted.reverse()
      : sorted;
  }, [data, sortProperty, isDescending, sortBy]);

  const sortOptions: SortOption<FileInfo>[] = [
    { property: "dateAdded", name: "Date" },
    { property: "filename", name: "Filename" },
    { property: "size", name: "Size" },
    { property: "extension", name: "Extension" },
    { property: "rating", name: "Rating" },
  ];

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
          <MdOutlineCreateNewFolder />
        </div>
      )}
      {data && (
        <div className={app.info}>
          Free space: {(data!.freeSpace / 1024 / 1024).toFixed(2)} mb
        </div>
      )}
    </div>
  );

  const handleSort = (option: SortOption<FileInfo>) => {
    sort(option.property);
  };

  const topbar = (
    <div className={tabStyles.topBar}>
      {breadcrumbs}
      <div
        className={cx(app.settings, {
          [app.hidden]: view === "gallery",
        })}
      >
        <>
          <FileSortOptions
            options={sortOptions}
            value={sortProperty!}
            onChange={(opt) => {
              //@ts-ignore
              handleSort(opt);
            }}
            isDescending={isDescending}
          />
          {view === "grid" && (
            <div className={app.zoomSlider}>
              <TbTelescope />
              <input
                type="range"
                min="1"
                max="4"
                value={zoom}
                onChange={(e) =>
                  setZoom(parseInt(e.target.value) as FileGridZoom)
                }
              />
            </div>
          )}
        </>

        {!isSelecting && (
          <div className={app.icons}>
            <MdOutlineListAlt
              className={cx({ [app.active]: view === "list" })}
              onClick={() => setView("list")}
            />
            <MdGridView
              className={cx({ [app.active]: view === "grid" })}
              onClick={() => setView("grid")}
            />
            {data?.contents.files?.some(isImage) && (
              <MdOutlinePhoto
                // @ts-ignore
                className={cx({ [app.active]: view === "gallery" })}
                onClick={() => setView("gallery")}
              />
            )}
          </div>
        )}
      </div>
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
      <div className={tabStyles.contentX}>
        {topbar}
        <div className={tabStyles.foldersFiles}>
          <section>
            {hasFetchedFolders && (
              <FolderList
                onSelect={handleSelectFolder}
                data={folderList!}
                activeFolder={activeFolder}
                isExpanded={(folder) => {
                  const hasActiveFolder = activeFolder !== "";
                  const isActiveFolder = activeFolder === "/" + folder.name;

                  return (
                    hasActiveFolder &&
                    (isActiveFolder ||
                      (activeFolder.includes(folder.name) &&
                        activeFolder.includes(folder.parent)))
                  );
                }}
              />
            )}
          </section>

          <section>
            {isFetched ? (
              <Files
                data={getSorted()}
                onSelectFolder={setActiveFolder}
                view={view}
                setView={setView}
                folders={sortedFolders}
                zoom={zoom}
                isSelecting={false}
              />
            ) : (
              <p>Fetching...</p>
            )}
          </section>
        </div>
      </div>
    ) : (
      <>
        {topbar}
        <Upload baseUrl={baseUrl} folder={activeFolder} />
      </>
    );

  const tabs = (
    <>
      <GoFileSubmodule
        className={cx({ [tabStyles.active]: activeTab === 0 })}
        onClick={() => setActiveTab(0)}
      />
      <GoCloudUpload
        className={cx({ [tabStyles.active]: activeTab === 1 })}
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
      <div className={tabStyles.container}>
        <div className={cx(tabStyles.tabs, tabStyles.vertical)}>{tabs}</div>
        <div className={cx(tabStyles.tabs, tabStyles.horizontal)}>{tabs}</div>
        <div className={tabStyles.content}>{content}</div>
      </div>
    </>
  );
}

export default App;
