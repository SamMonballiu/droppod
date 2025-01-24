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
  SortOption,
  Upload,
  FileDialog,
  formatBytes,
} from "@components";
import { FileInfo, FileType, is, isImage } from "@models/fileinfo";
import { FolderInfo } from "@models/folderInfo";
import { FilesResponse, DiskSpaceResponse } from "@models/response";
import axios from "axios";
import cx from "classnames";
import React, { FC, useEffect, useMemo, useState } from "react";
import {
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
  MdMusicNote,
} from "react-icons/md";
import { RxDoubleArrowLeft, RxDoubleArrowRight } from "react-icons/rx";
import { TbTelescope } from "react-icons/tb";
import { useQuery, useQueryClient } from "react-query";
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
import { useQuerystringSync } from "@hooks/useQuerystringSync";
import { useBaseUrlContext } from "./context/useBaseUrlContext";
import { useLocation } from "wouter";
import { useMediaListContext } from "./context/useMediaListContext";

const dateReviver = (key: string, value: any) => {
  if (key === "dateAdded" && Date.parse(value)) {
    return new Date(value);
  }

  return value;
};

type Tabs = "files" | "upload";

export type View = "list" | "grid" | "gallery";

interface Props {
  params: {
    "*": string;
  };
}

const App: FC<Props> = ({ params }) => {
  const [fileQuerystring, setFileQuerystring] = useQuerystringSync<string>(
    "file",
    ""
  );
  const [activeFolder, setActiveFolder] = useState("/" + params["*"]);

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
  const [, setLocation] = useLocation();
  const { addFiles: addToPlaylist } = useMediaListContext();

  const {
    filters: filesFilter,
    filterSetters,
    filterCollection,
    isActive: isFiltering,
    disable: disableFilters,
  } = useFilesFilter();

  const { baseUrl } = useBaseUrlContext();

  const { data, isFetched } = useQuery(
    ["files", activeFolder.toLowerCase()],
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
      onError: () => handleSelectFolder(""),
      onSuccess: (resp) => {
        if (!resp) {
          return;
        }

        const file = (resp.contents?.files ?? []).find(
          (f) => f.filename === fileQuerystring
        );

        if (file) {
          setTimeout(() => setFocusedFile(file), isImage(file) ? 800 : 100);
        }
      },
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

  const { handle, dialogs, select } = useApp(
    mutations,
    activeFolder,
    selectMode,
    focusedFile,
    focusedFolder,
    selectedFiles,
    setFocusedFile,
    setFocusedFolder,
    data,
    folderList,
    createFolderDialog,
    showNewFileDialog,
    showMoveDialog,
    showRenameDialog,
    showDeleteDialog
  );

  const handleCreateFolder = async (folderName: string) => {
    return await handle.folder.create(folderName);
  };

  const handleSelectFolder = (folderName: string) => {
    switch (selectMode) {
      case "single":
        const newFolder =
          folderName === ""
            ? ""
            : folderName.startsWith("/")
            ? folderName
            : "/" + folderName;
        queryClient.cancelQueries(["files"]);
        setActiveFolder(newFolder);
        setLocation(newFolder === "" ? "/" + newFolder : newFolder);
        if (!expandedFolders.includes(folderName)) {
          handleToggleExpanded(folderName);
        }
        break;
      case "multiple":
        //toggleSelected(folderName);
        break;
    }
  };

  const handleSelectFile = (file: FileInfo | null) => {
    setFocusedFile(file);
    setFileQuerystring(file?.filename ?? "");
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
      breadcrumbs={
        <div className={app.breadcrumbs}>
          <div>
            <Breadcrumbs
              path={activeFolder}
              onClick={handleSelectFolder}
              isReadOnly={activeTab === "upload"}
            />
          </div>
          {diskData && (
            <div className={app.info}>
              Free space: {formatBytes(diskData!.data.freeSpace)}
            </div>
          )}
        </div>
      }
      onSort={(option: SortOption<FileInfo>) => {
        sort(option.property);
      }}
    />
  );

  const handleToggleExpanded = (folderName: string) => {
    if (expandedFolders.includes(folderName)) {
      setExpandedFolders(expandedFolders.filter((x) => x !== folderName));
    } else {
      setExpandedFolders([...expandedFolders, folderName]);
    }
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
          {
            label: "Add to playlist",
            onClick: () => {
              if (data?.contents.files) {
                addToPlaylist(data.contents.files);
              }
            },

            icon: <MdMusicNote />,
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
                  onFocusFile={handleSelectFile}
                  onRename={select.file.forRename}
                  onRenameFolder={select.folder.forRename}
                  onMove={select.file.forMove}
                  onDelete={select.file.forDelete}
                  onDeleteFolder={select.folder.forDelete}
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

  const multiFileActions = (
    <div className={app.multiFileButtons}>
      <AiOutlineSend onClick={showMoveDialog.toggle} />
      <AiOutlineDelete onClick={showDeleteDialog.toggle} />
      {/* <MdMusicNote
        onClick={() =>
          addToPlaylist(
            data?.contents.files?.filter((f) =>
              selectedFiles.includes(f.filename)
            ) ?? []
          )
        }
      /> */}
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
            onClose={() => handleSelectFile(null)}
            file={focusedFile}
            onSave={
              is(focusedFile, FileType.Text) ? handle.file.create : undefined
            }
          />
        )}

      {dialogs.file.rename}
      {dialogs.folder.rename}
      {dialogs.file.move}
      {dialogs.file.delete}
      {dialogs.folder.delete}
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
};

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
  onSort: (value: SortOption<FileInfo>) => void;
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
  onSort,
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
                  onSort(opt);
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
