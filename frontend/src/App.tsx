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
  RenameDialog,
  DeleteDialog,
  formatBytes,
} from "@components";
import { CreateFilePostmodel } from "@backend/features/files/create/createFilePostmodel";
import { CreateFolderPostmodel } from "@backend/features/folders/create/createFolderPostmodel";
import { DeleteFolderPostmodel } from "@backend/features/folders/delete/deleteFolderPostmodel";
import { MoveFilesPostModel } from "@backend/features/files/move/moveFilesPostModel";
import { RenamePostModel } from "@backend/features/files/rename/renameFilePostmodel";
import { DeletePostmodel } from "@backend/features/files/delete/deleteFilePostmodel";
import { FileInfo, FileType, is, isImage } from "@models/fileinfo";
import { FolderInfo } from "@models/folderInfo";
import { FilesResponse, DiskSpaceResponse } from "@models/response";
import axios from "axios";
import cx from "classnames";
import React, { FC, useEffect, useMemo, useState } from "react";
import {
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlineSelect,
  AiOutlineSend,
} from "react-icons/ai";
import { GoCloudUpload, GoFileSubmodule } from "react-icons/go";
import {
  MdGridView,
  MdOutlineCreateNewFolder,
  MdOutlineListAlt,
  MdOutlinePhoto,
  MdFilterAlt,
  MdErrorOutline,
  MdOutlineTextSnippet,
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
import {
  LocationContextHandler,
  LocationContextMenu,
} from "@components/location/LocationContextMenu";
import { FilesFilter } from "@components/files/filter/FilesFilter";
import { Popover } from "@headlessui/react";
import {
  FilterSetters,
  FilterValues,
  useFilesFilter,
} from "@hooks/useFilesFilter";
import { CreateTextFileDialog } from "@components/files/create/CreateTextFileDialog";
import { useMutations } from "@hooks/useMutations";
import { useApp } from "./useApp";

const dateReviver = (key: string, value: any) => {
  if (key === "dateAdded" && Date.parse(value)) {
    return new Date(value);
  }

  return value;
};

type Tabs = "files" | "upload";

export type View = "list" | "grid" | "gallery";

function App() {
  const [activeFolder, setActiveFolder] = useState("");
  const [view, setView] = useState<View>("grid");
  const [selectMode, setSelectMode] = useState<"single" | "multiple">("single");
  const [zoom, setZoom] = useState<FileGridZoom>(2);
  const [activeTab, setActiveTab] = useState<Tabs>("files");
  const queryClient = useQueryClient();
  const createFolderDialog = useToggle(false);
  const showMoveDialog = useToggle(false);
  const showFolderList = useToggle(true);
  const showRenameDialog = useToggle(false);
  const showDeleteDialog = useToggle(false);
  const showNewFileDialog = useToggle(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [focusedFile, setFocusedFile] = useState<FileInfo | null>(null);
  const [focusedFolder, setFocusedFolder] = useState<FolderInfo | null>(null);

  const {
    filters: filesFilter,
    filterSetters,
    filterCollection,
    isActive: isFiltering,
    disable: disableFilters,
  } = useFilesFilter();

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

  const { data: diskData } = useQuery(["data"], async () => {
    return axios.get<DiskSpaceResponse>(`${baseUrl}freespace`);
  });

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
    !data
      ? []
      : filterCollection(filesFilter, data!.contents.files ?? [], {
          rating: (x: FileInfo) => x.rating,
          name: (x: FileInfo) => x.filename,
        }),
    "filename",
    false
  );

  const sortedFolders = useMemo(() => {
    if (!data || data.contents.folders.length === 0) {
      return [];
    }

    let filtered = data?.contents.folders;
    filtered = filterCollection(filesFilter, filtered, {
      name: (x: FolderInfo) => x.name,
    });

    if (sortProperty === "dateAdded") {
      filtered = filtered.sort((a, b) => sortBy(a, b, "dateAdded"));
    }

    if (sortProperty === "filename") {
      filtered = filtered.sort((a, b) => sortBy(a, b, "name"));
    }

    return isDescending && ["dateAdded", "filename"].includes(sortProperty!)
      ? filtered.reverse()
      : filtered;
  }, [data, sortProperty, isDescending, sortBy, filesFilter]);

  const mutations = useMutations(
    queryClient,
    baseUrl,
    activeFolder,
    setFocusedFile,
    setFocusedFolder,
    setSelectMode,
    setAllSelected,
    createFolderDialog,
    showNewFileDialog,
    showMoveDialog,
    showRenameDialog,
    showDeleteDialog
  );

  const { handle } = useApp(
    mutations,
    activeFolder,
    selectMode,
    focusedFile,
    focusedFolder,
    selectedFiles
  );

  const breadcrumbs = (
    <div className={app.breadcrumbs}>
      <div>
        <Breadcrumbs
          path={activeFolder}
          onClick={setActiveFolder}
          isReadOnly={activeTab === "upload"}
        />
      </div>
      {diskData && (
        <div className={app.info}>
          Free space: {formatBytes(diskData!.data.freeSpace)}
        </div>
      )}
    </div>
  );

  const handleSort = (option: SortOption<FileInfo>) => {
    sort(option.property);
  };

  const topbar = (
    <TopBar
      view={view}
      onSetView={setView}
      selectMode={selectMode}
      zoom={zoom}
      onSetZoom={setZoom}
      activeTab={activeTab}
      sortProperty={sortProperty}
      isDescending={isDescending}
      isFiltering={isFiltering}
      filesFilter={filesFilter}
      filterSetters={filterSetters}
      showGalleryButton={data?.contents.files?.some(isImage) ?? false}
      breadcrumbs={breadcrumbs}
    />
  );

  const handleCreateFolder = async (folderName: string) => {
    return await handle.folder.create(folderName);
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

  const handleSelectFolderForRename = (folder: FolderInfo) => {
    showRenameDialog.set(true);
    setFocusedFolder(folder);
  };

  const handleSelectForMove = (file: FileInfo) => {
    showMoveDialog.set(true);
    setFocusedFile(file);
  };

  const handleSelectForDelete = (file: FileInfo) => {
    showDeleteDialog.set(true);
    setFocusedFile(file);
  };

  const handleSelectFolderForDelete = (folder: FolderInfo) => {
    showDeleteDialog.set(true);
    setFocusedFolder(folder);
  };

  const currentFolderContextHandlers: LocationContextHandler[] =
    selectMode === "multiple"
      ? []
      : [
          {
            label: "New folder",
            onClick: createFolderDialog.toggle,
            icon: <MdOutlineCreateNewFolder />,
          },
          {
            label: "New text file",
            onClick: showNewFileDialog.toggle,
            icon: <MdOutlineTextSnippet />,
          },
          {
            label: "Select files",
            onClick: () => setSelectMode("multiple"),
            icon: <AiOutlineSelect />,
          },
        ];

  const content =
    activeTab === "files" ? (
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
              <LocationContextMenu
                location={data!.contents}
                handlers={currentFolderContextHandlers}
              >
                <Files
                  isFiltered={isFiltering}
                  disableFilters={disableFilters}
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
                  onRenameFolder={handleSelectFolderForRename}
                  onMove={handleSelectForMove}
                  onDelete={handleSelectForDelete}
                  onDeleteFolder={handleSelectFolderForDelete}
                />
              </LocationContextMenu>
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
        className={cx({ [tabStyles.active]: activeTab === "files" })}
        onClick={() => setActiveTab("files")}
      />
      <GoCloudUpload
        className={cx({ [tabStyles.active]: activeTab === "upload" })}
        onClick={() => setActiveTab("upload")}
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
      onConfirm={handle.file.move}
      isMoving={mutations.files.move.isLoading}
    />
  );

  const renameFileDialog = focusedFile ? (
    <RenameDialog
      currentName={focusedFile!.filename}
      validateName={getRenameValidator(
        focusedFile!.filename,
        data?.contents.files,
        data?.contents.folders
      )}
      onConfirm={async (newName) => await handle.file.rename(newName)}
      isOpen={showRenameDialog.value}
      onClose={() => {
        showRenameDialog.toggle();
        setFocusedFile(null);
      }}
    />
  ) : null;

  const renameFolderDialog = focusedFolder ? (
    <RenameDialog
      currentName={focusedFolder!.name}
      validateName={getRenameValidator(
        focusedFolder!.name,
        data?.contents.files,
        data?.contents.folders
      )}
      onConfirm={async (newName) => await handle.folder.rename(newName)}
      isOpen={showRenameDialog.value}
      onClose={() => {
        showRenameDialog.set(false);
        setFocusedFolder(null);
      }}
    />
  ) : null;

  const deleteDialog = (
    <DeleteDialog
      isOpen={
        showDeleteDialog.value &&
        (focusedFile !== null || selectedFiles.length > 0)
      }
      onClose={() => {
        setFocusedFile(null);
        showDeleteDialog.toggle();
      }}
      names={focusedFile ? [focusedFile.filename] : selectedFiles}
      mode="file"
      onConfirm={handle.file.delete}
      isDeleting={mutations.files.delete.isLoading}
    />
  );

  const deleteFolderDialog = React.useMemo(() => {
    return focusedFolder === null ? null : (
      <DeleteDialog
        isOpen={showDeleteDialog.value && focusedFolder !== null}
        onClose={() => {
          setFocusedFolder(null);
          showDeleteDialog.toggle();
        }}
        names={[focusedFolder!.name]}
        mode="folder"
        onConfirm={(names) => handle.folder.delete(names[0])}
        isDeleting={mutations.folders.delete.isLoading}
      />
    );
  }, [focusedFolder]);

  const multiFileActions = (
    <div className={app.multiFileButtons}>
      <AiOutlineSend onClick={showMoveDialog.toggle} />
      <AiOutlineDelete onClick={showDeleteDialog.toggle} />
    </div>
  );

  return (
    <>
      {focusedFile &&
        !showRenameDialog.value &&
        !showMoveDialog.value &&
        !showDeleteDialog.value && (
          <FileDialog
            isOpen={focusedFile !== null}
            onClose={() => setFocusedFile(null)}
            file={focusedFile}
            onSave={
              is(focusedFile, FileType.Text) ? handle.file.create : undefined
            }
          />
        )}

      {renameFileDialog}
      {renameFolderDialog}
      {moveFilesDialog}
      {deleteDialog}
      {deleteFolderDialog}
      {createFolderDialog.value && (
        <CreateFolderDialog
          onClose={createFolderDialog.toggle}
          onSubmit={handleCreateFolder}
        />
      )}
      {showNewFileDialog.value && (
        <CreateTextFileDialog
          isSubmitting={mutations.files.create.isLoading}
          isOpen={showNewFileDialog.value}
          onClose={showNewFileDialog.toggle}
          onSubmit={handle.file.create}
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
          onCancel={() => setSelectMode("single")}
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

interface TopBarProps {
  view: View;
  selectMode: "single" | "multiple";
  zoom: FileGridZoom;
  onSetZoom: (zoom: FileGridZoom) => void;
  onSetView: (view: View) => void;
  activeTab: Tabs;
  sortProperty: keyof FileInfo | null;
  isDescending: boolean;
  isFiltering: boolean;
  filesFilter: FilterValues;
  filterSetters: FilterSetters;
  showGalleryButton: boolean;
  breadcrumbs: React.ReactNode;
}

const TopBar: FC<TopBarProps> = ({
  view,
  onSetView,
  selectMode,
  zoom,
  onSetZoom,
  activeTab,
  sortProperty,
  isDescending,
  isFiltering,
  filesFilter,
  filterSetters,
  showGalleryButton,
  breadcrumbs,
}) => {
  const sortOptions: SortOption<FileInfo>[] = [
    { property: "filename", name: "Filename" },
    { property: "dateAdded", name: "Date" },
    { property: "size", name: "Size" },
    { property: "extension", name: "Extension" },
    { property: "rating", name: "Rating" },
  ];

  return (
    <div className={tabStyles.topBar}>
      {activeTab !== "upload" ? (
        <div
          className={cx(app.settings, {
            [app.hidden]: view === "gallery",
          })}
        >
          <>
            <div className={app.fileControls}>
              <FileSortOptions
                options={sortOptions}
                value={sortProperty!}
                onChange={(opt) => {
                  //@ts-ignore
                  handleSort(opt);
                }}
                isDescending={isDescending}
              />

              <Popover style={{ position: "relative" }} as="div">
                <Popover.Button as="div" className={app.button}>
                  <MdFilterAlt />
                  {isFiltering ? (
                    <MdErrorOutline title="Some files are currently being filtered." />
                  ) : null}
                </Popover.Button>

                <Popover.Panel style={{ position: "absolute" }}>
                  <FilesFilter
                    filter={filesFilter}
                    onChange={filterSetters}
                    isFiltering={isFiltering}
                  />
                </Popover.Panel>
              </Popover>
            </div>

            {view === "grid" && selectMode === "single" && (
              <div className={app.zoomSlider}>
                <TbTelescope />
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={zoom}
                  onChange={(e) =>
                    onSetZoom(parseInt(e.target.value) as FileGridZoom)
                  }
                />
              </div>
            )}
          </>

          {selectMode === "single" && (
            <div className={app.icons}>
              <MdOutlineListAlt
                className={cx({ [app.active]: view === "list" })}
                onClick={() => onSetView("list")}
              />
              <MdGridView
                className={cx({ [app.active]: view === "grid" })}
                onClick={() => onSetView("grid")}
              />
              {showGalleryButton && (
                <MdOutlinePhoto
                  // @ts-ignore
                  className={cx({ [app.active]: view === "gallery" })}
                  onClick={() => onSetView("gallery")}
                />
              )}
            </div>
          )}
        </div>
      ) : null}
      {breadcrumbs}
    </div>
  );
};
