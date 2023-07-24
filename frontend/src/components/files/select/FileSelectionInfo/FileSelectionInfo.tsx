import { FC } from "react";
import { FilesResponse } from "@models/response";
import { FileSize, SelectionInfo } from "@components";

interface Props {
  data: FilesResponse;
  isSelected: (name: string) => boolean;
  onClearSelection: () => void;
  onSelectAll: () => void;
  actions?: React.ReactNode;
  onCancel: () => void;
}

export const FileSelectionInfo: FC<Props> = ({
  data,
  isSelected,
  ...props
}) => {
  const files = data.contents.files ?? [];
  const selectedFiles = files
    .filter((f) => isSelected(f.filename))
    .map((f) => ({ name: f.filename, size: f.size }));

  const folders = data.contents.folders;
  const selectedFolders = folders
    .filter((f) => isSelected(f.parent + "/" + f.name))
    .map((f) => ({ name: f.name, size: 0 }));

  const items = selectedFolders.concat(selectedFiles);

  return (
    <SelectionInfo
      items={items}
      renderItem={(item: { name: string }) => (
        <p key={item.name}>{item.name}</p>
      )}
      summary={items.length ? <FileSize files={items} /> : null}
      {...props}
    />
  );
};
