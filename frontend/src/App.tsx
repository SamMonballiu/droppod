import {
  Breadcrumbs,
  Collapsible,
  CreateFolderDialog,
  FileGridZoom,
  Files,
  FileSortOptions,
  FileSelectionInfo,
  FolderList,
  Loading,
  MoveFilesDialog,
  SortOption,
  Upload,
  FileDialog,
} from "@components";
import { RenameDialog } from "@components/RenameDialog/RenameDialog";
import { FileInfo, isImage } from "@models/fileinfo";
import { FolderInfo } from "@models/folderInfo";
import {
  CreateFolderPostmodel,
  MoveFilesPostModel,
  RenamePostModel,
} from "@models/post";
import { FilesResponse } from "@models/response";
import axios from "axios";
import cx from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import { AiOutlineSelect, AiOutlineSend } from "react-icons/ai";
import { GoCloudUpload, GoFileSubmodule } from "react-icons/go";
import {
  MdGridView,
  MdOutlineCreateNewFolder,
  MdOutlineListAlt,
  MdOutlinePhoto,
} from "react-icons/md";
import { RxDoubleArrowLeft, RxDoubleArrowRight } from "react-icons/rx";
import { TbTelescope } from "react-icons/tb";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getRenameValidator } from "validators/rename";
import app from "./App.module.scss";
import useSelectList from "./hooks/useSelectList";
import { sortBy, useSortedList } from "./hooks/useSortedList";
import useToggle from "./hooks/useToggle";
import tabStyles from "./Tabs.module.scss";

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
  const showRenameDialog = useToggle(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [focusedFile, setFocusedFile] = useState<FileInfo | null>(null);

  const baseUrl = import.meta.env.DEV
    ? window.location.href.replace("5173", "4004")
    : window.location.href;

  const { data, isFetched } = useQuery(
    ["files", activeFolder],
    async ({ signal }) => {
      let url = baseUrl + "files";
      if (activeFolder !== "") {
        url += `?folder=${encodeURIComponent(activeFolder)}`;
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
            setFocusedFile(null);
          },
        }
      ),
      rename: useMutation(
        async (postmodel: RenamePostModel) => {
          const url = baseUrl + "files/rename";
          await axios.post(url, postmodel);
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["files", activeFolder]);
            showRenameDialog.set(false);
            setFocusedFile(null);
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
      filenames:
        selectMode === "multiple"
          ? selectedFiles
          : [focusedFile?.filename ?? ""],
    };

    return await mutations.files.move.mutateAsync(postmodel);
  };

  const handleRename = async (newName: string) => {
    const postmodel: RenamePostModel = {
      path: activeFolder,
      currentName: focusedFile!.filename,
      newName,
    };

    return await mutations.files.rename.mutateAsync(postmodel);
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

  const handleSelectForRename = (file: FileInfo) => {
    showRenameDialog.set(true);
    setFocusedFile(file);
  };

  const handleSelectForMove = (file: FileInfo) => {
    showMoveDialog.set(true);
    setFocusedFile(file);
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
                onFocusFile={setFocusedFile}
                onRename={handleSelectForRename}
                onMove={handleSelectForMove}
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

  const moveFilesDialog = !folderList ? null : (
    <MoveFilesDialog
      isOpen={showMoveDialog.value}
      onClose={() => {
        showMoveDialog.toggle();
        setFocusedFile(null);
      }}
      data={folderList}
      activeFolder={activeFolder}
      files={
        selectMode === "multiple"
          ? selectedFiles
          : [focusedFile?.filename ?? ""]
      }
      onConfirm={handleMoveFiles}
      isMoving={mutations.files.move.isLoading}
    />
  );

  const renameFileDialog = focusedFile ? (
    <RenameDialog
      currentName={focusedFile!.filename}
      validateName={getRenameValidator(
        focusedFile,
        data?.contents.files,
        data?.contents.folders
      )}
      onConfirm={async (newName) => await handleRename(newName)}
      isOpen={showRenameDialog.value}
      onClose={() => {
        showRenameDialog.toggle();
        setFocusedFile(null);
      }}
    />
  ) : null;

  const multiFileActions = (
    <div className={app.multiFileButtons}>
      <AiOutlineSend onClick={showMoveDialog.toggle} />
      <AiOutlineSelect onClick={() => setSelectMode("single")} />
    </div>
  );

  return (
    <>
      {focusedFile && !showRenameDialog.value && !showMoveDialog.value && (
        <FileDialog
          isOpen={focusedFile !== null}
          onClose={() => setFocusedFile(null)}
          file={focusedFile}
        />
      )}

      {renameFileDialog}
      {moveFilesDialog}
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
