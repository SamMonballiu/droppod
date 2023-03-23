import fs from "fs-extra";
import { CommandHandleResultType } from "../base";
import {
  MoveFilesCommand,
  MoveFilesCommandHandler,
  MoveFilesCommandValidator,
} from "../moveFilesCommand";
import { filesCache } from "../../files-cache";

const command = new MoveFilesCommand(
  "location",
  ["file", "file2", "file3"],
  "destination",
  filesCache
);

const handler = new MoveFilesCommandHandler();

const validator = new MoveFilesCommandValidator();

describe("MoveFilesCommandValidator", () => {
  it("can validate a MoveFilesCommand", () => {
    expect(validator.canValidate(command)).toBe(true);
  });

  it("returns an error if the location doesn't exist", () => {
    // Arrange
    const existsSpy = jest.spyOn(fs, "existsSync");
    existsSpy.mockImplementation((path: fs.PathLike) => {
      if (path.toString().endsWith("location")) {
        return false;
      }

      return true;
    });

    // Act
    const result = validator.validate(command);

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toBe("Location doesn't exist.");
  });

  it("returns an error if the destination doesn't exist", () => {
    // Arrange
    const existsSpy = jest.spyOn(fs, "existsSync");
    existsSpy.mockImplementation((path: fs.PathLike) => {
      if (path.toString().endsWith("destination")) {
        return false;
      }

      return true;
    });

    // Act
    const result = validator.validate(command);

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toBe("Destination doesn't exist.");
  });

  it("returns an error if some of the files doesn't exist", () => {
    // Arrange
    const existsSpy = jest.spyOn(fs, "existsSync");
    existsSpy.mockImplementation((path: fs.PathLike) => {
      if (
        path.toString().endsWith("file2") ||
        path.toString().endsWith("file3")
      ) {
        return false;
      }

      return true;
    });

    // Act
    const result = validator.validate(command);

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.errors.length).toBe(2);
    expect(result.errors[0]).toBe("location/file2 doesn't exist.");
    expect(result.errors[1]).toBe("location/file3 doesn't exist.");
  });

  it("return no errors if location, files and destination all exist", () => {
    // Arrange
    const existsSpy = jest.spyOn(fs, "existsSync");
    existsSpy.mockImplementation(() => true);

    // Act
    const result = validator.validate(command);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});

describe("MoveFilesCommandHandler", () => {
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