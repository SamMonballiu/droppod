import { mockFilesCache, mockRatings } from "@mocks";
import {
  RenameFolderCommand,
  RenameFolderCommandHandler,
  RenameFolderCommandValidator,
} from "./renameFolderCommand";
import fs from "fs-extra";
import { CommandHandleResultType } from "@commands";

const command = new RenameFolderCommand("path", "currentName", "newName");
const validator = new RenameFolderCommandValidator();
const handler = new RenameFolderCommandHandler(mockFilesCache, mockRatings);

describe("RenameFolderCommandValidator", () => {
  it("can validate a RenameFolderCommand", () => {
    expect(validator.canValidate(command)).toBe(true);
  });

  it("returns an error if the folder to rename doesn't exist", () => {
    const existsSpy = jest
      .spyOn(fs, "existsSync")
      .mockImplementation(() => false);

    const result = validator.validate(command);

    expect(result.isSuccess).toBe(false);
    expect(result.errors[0]).toBe(
      "No folder named 'currentName' could be found in the specified path."
    );
    expect(existsSpy).toHaveBeenCalled();
    existsSpy.mockRestore();
  });

  it("returns an error if a folder with the new name already exists", () => {
    const existsSpy = jest
      .spyOn(fs, "existsSync")
      .mockImplementation(() => true);

    const result = validator.validate(command);

    expect(result.isSuccess).toBe(false);
    expect(result.errors[0]).toBe(
      "A folder named 'newName' already exists in the specified path."
    );
    existsSpy.mockRestore();
  });
});

describe("RenameFolderCommandHandler", () => {
  it("renames the folder", () => {
    const renameSpy = jest.spyOn(fs, "renameSync").mockImplementation(() => {});

    const result = handler.handle(command);

    expect(result.type).toBe(CommandHandleResultType.Success);
    expect(renameSpy).toHaveBeenCalledWith("path/currentName", "path/newName");
    renameSpy.mockRestore();
  });

  it("invalidates the files cache for the specified path", () => {
    const renameSpy = jest.spyOn(fs, "renameSync").mockImplementation(() => {});
    const invalidateSpy = jest.spyOn(mockFilesCache, "invalidate");

    handler.handle(command);

    expect(renameSpy).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith("path");
  });

  it("also transfers ratings for files in the folder", () => {
    jest.spyOn(fs, "renameSync").mockImplementation(() => {});
    const transferFolderRatingSpy = jest.spyOn(mockRatings, "transferFolder");

    handler.handle(command);

    expect(transferFolderRatingSpy).toHaveBeenCalledWith(
      "/path/currentName",
      "/path/newName"
    );
  });
});
