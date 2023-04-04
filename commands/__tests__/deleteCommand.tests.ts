import {
  DeleteCommand,
  DeleteCommandHandler,
  DeleteCommandValidator,
} from "../deleteCommand";
import { mockFilesCache } from "../mocks";
import fs from "fs-extra";
import { CommandHandleResultType } from "../base";

const command = new DeleteCommand("path", "itemname");
const validator = new DeleteCommandValidator();
const handler = new DeleteCommandHandler(mockFilesCache);

describe("DeleteCommandValidator", () => {
  it("can validate a DeleteCommand", () => {
    expect(command instanceof DeleteCommand).toBe(true);
    expect(validator.canValidate(command)).toBe(true);
  });

  it("returns an error if the file or folder to delete doesn't exist", () => {
    const existsSpy = jest
      .spyOn(fs, "existsSync")
      .mockImplementation(() => false);

    const result = validator.validate(command);

    expect(result.isSuccess).toBe(false);
    expect(result.errors[0]).toBe(
      "No file or folder with the name 'itemname' could be found in the specified path."
    );
    expect(existsSpy).toHaveBeenCalled();
    existsSpy.mockRestore();
  });
});

describe("DeleteCommandHandler", () => {
  it("deletes the file/folder", () => {
    const deleteSpy = jest.spyOn(fs, "removeSync").mockImplementation(() => {});

    const result = handler.handle(command);

    expect(result.type).toBe(CommandHandleResultType.Success);
    expect(deleteSpy).toHaveBeenCalled();
    deleteSpy.mockRestore();
  });

  it("invalidates the files cache for the specified path", () => {
    const deleteSpy = jest.spyOn(fs, "removeSync").mockImplementation(() => {});
    const invalidateSpy = jest.spyOn(mockFilesCache, "invalidate");

    handler.handle(command);

    expect(deleteSpy).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalled();
    deleteSpy.mockRestore();
    invalidateSpy.mockRestore();
  });
});
