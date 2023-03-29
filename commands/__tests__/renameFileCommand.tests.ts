import {
  RenameFileCommand,
  RenameFileCommandHandler,
  RenameFileCommandValidator,
} from "../renameFileCommand";
import fs from "fs-extra";
import { CommandHandleResultType } from "../base";
jest.mock("fdir");
import { fdir } from "fdir";
import { mockFilesCache } from "../mocks";

const command = new RenameFileCommand("path", "currentName", "newName");
const validator = new RenameFileCommandValidator();
const handler = new RenameFileCommandHandler(mockFilesCache);

describe("RenameFileCommandValidator", () => {
  it("can validate a RenameFileCommand", () => {
    expect(validator.canValidate(command)).toBe(true);
  });

  it("returns an error if the file to rename doesn't exist", () => {
    const existsSpy = jest
      .spyOn(fs, "existsSync")
      .mockImplementation(() => false);

    const result = validator.validate(command);

    expect(result.isSuccess).toBe(false);
    expect(result.errors[0]).toBe(
      "No file with the name 'currentName' could be found in the specified path."
    );
    expect(existsSpy).toHaveBeenCalled();
    existsSpy.mockRestore();
  });

  it("returns an error if a file with the new name already exists", () => {
    const syncMock = jest.fn().mockImplementation(() => ["newName"]);
    const crawlerMock = jest.fn().mockImplementation(() => {
      return {
        sync: () => ["newName"],
      };
    });
    jest.spyOn(fdir.prototype, "crawl").mockImplementation(crawlerMock);

    const existsSpy = jest
      .spyOn(fs, "existsSync")
      .mockImplementation(() => true);

    const result = validator.validate(command);

    expect(result.isSuccess).toBe(false);
    expect(result.errors[0]).toBe(
      "A file with the name 'newName' already exists in the specified path."
    );
    existsSpy.mockRestore();
  });
});

describe("RenameFileCommandHandler", () => {
  it("renames the file", () => {
    const renameSpy = jest.spyOn(fs, "renameSync").mockImplementation(() => {});

    const result = handler.handle(command);

    expect(result.type).toBe(CommandHandleResultType.Success);
    expect(renameSpy).toHaveBeenCalled();
    renameSpy.mockRestore();
  });

  it("invalidates the files cache for the specified path", () => {
    const renameSpy = jest.spyOn(fs, "renameSync").mockImplementation(() => {});
    const invalidateSpy = jest.spyOn(mockFilesCache, "invalidate");

    handler.handle(command);

    expect(renameSpy).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith("path");
  });
});
