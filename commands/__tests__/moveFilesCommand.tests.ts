import fs from "fs-extra";
import { CommandHandleResultType } from "../base";
import { MoveFilesCommand, MoveFilesCommandHandler } from "../moveFilesCommand";
import { filesCache } from "./../../files-cache";

describe("MoveFilesCommandHandler", () => {
  const command = new MoveFilesCommand(
    "location",
    ["file", "file2", "file3"],
    "destination",
    filesCache
  );

  const handler = new MoveFilesCommandHandler();

  it("can handle a MoveFilesCommand", () => {
    expect(handler.canHandle(command)).toBe(true);
  });

  it("should move the files", () => {
    const moveSpy = jest.spyOn(fs, "moveSync");
    moveSpy.mockImplementation(() => {
      return;
    });

    const result = handler.handle(command);

    expect(result.type).toBe(CommandHandleResultType.Success);
    expect(moveSpy).toHaveBeenCalledTimes(3);
  });

  it("should invalidate the files cache", () => {
    const invalidateSpy = jest.spyOn(filesCache, "invalidate");

    handler.handle(command);

    expect(invalidateSpy).toHaveBeenCalledWith("location");
    expect(invalidateSpy).toHaveBeenCalledWith("destination");
  });
});
