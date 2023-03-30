import { FC } from "react";
import { FilesResponse } from "../../../models/response";
import SelectionInfo from "../SelectionInfo/SelectionInfo";

interface Props {
  data: FilesResponse;
  isSelected: (name: string) => boolean;
  onClearSelection: () => void;
  onSelectAll: () => void;
  actions?: React.ReactNode;
}

const FileSelectionInfo: FC<Props> = ({ data, isSelected, ...props }) => {
  const files = data.contents.files ?? [];
  const selectedFiles = files
    .filter((f) => isSelected(f.filename))
    .map((f) => f.filename);

  const folders = data.contents.folders;
  const selectedFolders = folders
    .filter((f) => isSelected(f.parent + "/" + f.name))
    .map((f) => f.name);

  return (
    <SelectionInfo
      items={selectedFolders.concat(selectedFiles)}
      renderItem={(name: string) => <p key={name}>{name}</p>}
      {...props}
    />
  );
};

export default FileSelectionInfo;
