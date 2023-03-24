import app from "./App.module.scss";
import tabStyles from "./Tabs.module.scss";
import Upload from "./Upload/Upload";
import React, { useEffect, useMemo, useState } from "react";
import { FilesResponse } from "../../models/response";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Files from "./Files/Files";
import Breadcrumbs from "./Breadcrumbs/Breadcrumbs";
import { CreateFolderPostmodel, MoveFilesPostModel } from "../../models/post";
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

import { RxDoubleArrowLeft, RxDoubleArrowRight } from "react-icons/rx";
import Collapsible from "./Collapsible/Collapsible";
import Loading from "./Loading/Loading";
import useSelectList from "./hooks/useSelectList";
import FileSelectionInfo from "./FileSelectionInfo/FileSelectionInfo";
import MoveFilesDialog from "./MoveFilesDialog/MoveFilesDialog";
import { AiOutlineSelect, AiOutlineSend } from "react-icons/ai";

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
  const [view, setView] = useState<View>("grid");
  const [selectMode, setSelectMode] = useState<"single" | "multiple">("single");
  const [zoom, setZoom] = useState<FileGridZoom>(2);
  const [activeTab, setActiveTab] = useState<number>(0);
  const queryClient = useQueryClient();
  const createFolderDialog = useToggle(false);
  const showMoveDialog = useToggle(false);
  const showFolderList = useToggle(true);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);

  const baseUrl = import.meta.env.DEV
    ? window.location.href.replace("5173", "4004")
    : window.location.href;

  const { data, isFetched } = useQuery(
    ["files", activeFolder],
    async ({ signal }) => {
      let url = baseUrl + "files";
      if (activeFolder !== "") {
        url += `?folder=${activeFolder}`;
      }

      return (
        await axios.get<FilesResponse>(url, {
          transformResponse: (data) => JSON.parse(data, dateReviver),
          signal,
        })
      ).data;
    },
    {
      staleTime: Infinity,
    }
  );

  const [selectedFiles, isSelected, toggleSelected, , setAllSelected, events] =
    useSelectList(
      (data?.contents.files?.map((f) => f.filename) ?? []).concat(
        data?.contents.folders.map((f) => f.name) ?? []
      )
    );

  useEffect(() => {
    if (selectMode === "single") {
      setAllSelected(false);
    }
  }, [selectMode]);

  const { data: folderList, isFetching: isFetchingFolderList } = useQuery(
    ["folders"],
    async () => {
      let url = baseUrl + "folders";
      return (await axios.get<FolderInfo>(url)).data;
    }
  );

  const { getSorted, sortProperty, isDescending, sort } = useSortedList(
    data?.contents.files ?? [],
    "filename",
    false
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
    { property: "filename", name: "Filename" },
    { property: "dateAdded", name: "Date" },
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
            queryClient.invalidateQueries(["folders"]);
            createFolderDialog.set(false);
          },
        }
      ),
    },
    files: {
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

  const handleMoveFiles = async (destination: string) => {
    const postmodel: MoveFilesPostModel = {
      location: activeFolder,
      destination,
      filenames: selectedFiles,
    };

    return await mutations.files.move.mutateAsync(postmodel);
  };

  const breadcrumbs = (
    <div className={app.breadcrumbs}>
      <div>
        <Breadcrumbs
          path={activeFolder}
          onClick={setActiveFolder}
          isReadOnly={activeTab === Tabs.Upload}
        />
        {activeTab !== Tabs.Upload && (
          <>
            <MdOutlineCreateNewFolder
              className={app.button}
              onClick={createFolderDialog.toggle}
            />
            <AiOutlineSelect
              className={app.button}
              onClick={() =>
                setSelectMode(selectMode === "multiple" ? "single" : "multiple")
              }
            />
          </>
        )}
      </div>
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
          {view === "grid" && selectMode === "single" && (
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

        {selectMode === "single" && (
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
      {breadcrumbs}
    </div>
  );

  const handleCreateFolder = async (folderName: string) => {
    return await onCreateFolder(folderName);
  };

  const handleSelectFolder = (folderName: string) => {
    switch (selectMode) {
      case "single":
        queryClient.cancelQueries(["files"]);
        setActiveFolder(folderName === "" ? "" : "/" + folderName);
        if (!expandedFolders.includes(folderName)) {
          handleToggleExpanded(folderName);
        }
        break;
      case "multiple":
        //toggleSelected(folderName);
        break;
    }
  };

  const handleToggleExpanded = (folderName: string) => {
    if (expandedFolders.includes(folderName)) {
      setExpandedFolders(expandedFolders.filter((x) => x !== folderName));
    } else {
      setExpandedFolders([...expandedFolders, folderName]);
    }
  };

  const content =
    activeTab == 0 ? (
      <div className={tabStyles.contentX}>
        {topbar}
        <div className={tabStyles.foldersFiles}>
          <section>
            {isFetchingFolderList ? (
              <Loading
                animated
                className={cx(
                  tabStyles.folderList,
                  tabStyles.loadingFolderList
                )}
              />
            ) : (
              //@ts-ignore
              <Collapsible
                collapsed={!showFolderList.value}
                expandButton={
                  <RxDoubleArrowRight
                    className={app.folderListIcon}
                    onClick={showFolderList.toggle}
                  />
                }
              >
                <div className={app.folderListContainer}>
                  <RxDoubleArrowLeft
                    className={cx(app.collapse, app.folderListIcon)}
                    onClick={showFolderList.toggle}
                  />
                  <FolderList
                    className={tabStyles.folderList}
                    onSelect={handleSelectFolder}
                    data={folderList!}
                    isExpanded={(folder) =>
                      expandedFolders.includes(folder.parent + folder.name)
                    }
                    isActiveFolder={(folder) =>
                      activeFolder === `/${folder.parent}${folder.name}`
                    }
                    onToggleExpanded={handleToggleExpanded}
                  />
                </div>
              </Collapsible>
            )}
          </section>

          <section>
            {isFetched ? (
              <Files
                data={getSorted()}
                onSelectFolder={handleSelectFolder}
                view={view}
                setView={setView}
                folders={sortedFolders}
                zoom={zoom}
                isSelecting={selectMode === "multiple"}
                onToggleSelected={toggleSelected}
                onSelectedChanged={events.onSelectedChanged}
                onSetAllSelected={events.onSetAllSelected}
              />
            ) : (
              <Loading animated className={cx(tabStyles.loadingFiles)} />
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

  const folderPicker = !folderList ? null : (
    <MoveFilesDialog
      isOpen={showMoveDialog.value}
      onClose={showMoveDialog.toggle}
      data={folderList}
      activeFolder={activeFolder}
      files={selectedFiles}
      onConfirm={handleMoveFiles}
      isMoving={mutations.files.move.isLoading}
    />
  );

  const multiFileActions = (
    <div className={app.multiFileButtons}>
      <AiOutlineSend onClick={showMoveDialog.toggle} />
      <AiOutlineSelect onClick={() => setSelectMode("single")} />
    </div>
  );

  return (
    <>
      {folderPicker}
      {createFolderDialog.value && (
        <CreateFolderDialog
          onClose={createFolderDialog.toggle}
          onSubmit={handleCreateFolder}
        />
      )}
      {selectMode === "multiple" && isFetched && (
        <FileSelectionInfo
          data={data!}
          isSelected={isSelected}
          onClearSelection={() => setAllSelected(false)}
          onSelectAll={() => {
            setAllSelected(true);
          }}
          actions={multiFileActions}
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
