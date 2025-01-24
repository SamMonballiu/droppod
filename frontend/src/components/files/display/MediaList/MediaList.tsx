import { FileInfo, FileType, is, isImage } from "@models/fileinfo";
import { FolderInfo } from "@models/folderInfo";
import { FilesResponse } from "@models/response";
import { useBaseUrlContext } from "@root/context/useBaseUrlContext";
import axios from "axios";
import { FC, useState } from "react";
import { useQuery } from "react-query";
import { File, FileGrid } from "@components/files/display/FileGrid/FileGrid";
import { useMediaListContext } from "@root/context/useMediaListContext";
import styles from "./MediaList.module.scss";
import { Playlist } from "./Playlist";

const dateReviver = (key: string, value: any) => {
  if (key === "dateAdded" && Date.parse(value)) {
    return new Date(value);
  }

  return value;
};

const isMedia = (file: FileInfo) =>
  is(file, FileType.Audio) || is(file, FileType.Video);

interface Props {
  files: FileInfo[];
  folders: FolderInfo[];
}

export const MediaList: FC<Props> = ({ files, folders }) => {
  const [selectedFolder, setSelectedFolder] = useState<FolderInfo | undefined>(
    undefined
  );

  const handleSelectFolder = (folder: string) => {
    const newFolder = folders.find((x) => folder === `${x.parent}/${x.name}`);
    setSelectedFolder(newFolder);
  };

  const { files: playlist, addFile: addToPlaylist } = useMediaListContext();

  return (
    <div className={styles.mediaList}>
      {selectedFolder === undefined ? (
        <FileGrid
          files={[]}
          folders={folders}
          onSelectFile={addToPlaylist}
          onSelectFolder={handleSelectFolder}
          thumbnails={[]}
          fileContextHandlers={[]}
          folderContextHandlers={[]}
          zoom={3}
        />
      ) : (
        <MediaFolder
          folder={selectedFolder!}
          onReturn={() => setSelectedFolder(undefined)}
        />
      )}
      <div className={styles.playlist}>
        <Playlist />
      </div>
    </div>
  );
};

interface FolderProps {
  folder: FolderInfo;
  onReturn: () => void;
}

const MediaFolder: FC<FolderProps> = ({ folder, onReturn }) => {
  const { baseUrl } = useBaseUrlContext();
  const { files: playlist, addFile: addToPlaylist } = useMediaListContext();

  const { data, isFetched } = useQuery(
    ["files", folder.name],
    async ({ signal }) => {
      let url = baseUrl + "files";
      url += `?folder=${encodeURIComponent(folder.parent)}/${encodeURIComponent(
        folder.name
      )}`;

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

  return (
    <div>
      <h4 onClick={onReturn}>{folder.name}</h4>
      <div style={{ display: "flex" }}>
        <FileGrid
          files={(data?.contents.files ?? []).filter(isMedia)}
          folders={[]}
          onSelectFile={addToPlaylist}
          onSelectFolder={function (folder: string): void {
            throw new Error("Function not implemented.");
          }}
          thumbnails={[]}
          fileContextHandlers={[]}
          folderContextHandlers={[]}
          zoom={2}
        />
      </div>
    </div>
  );
};
