import path from "path";
import fs from "fs";
import { CommandHandleResultType } from "../base";
import {
  CreateFolderCommand,
  CreateFolderCommandHandler,
  CreateFolderCommandValidator,
} from "../createFolderCommand";

const command = new CreateFolderCommand("location", "folderName");
const handler = new CreateFolderCommandHandler();
const validator = new CreateFolderCommandValidator();

describe("CreateFolderCommandHandler", () => {
  it("can handle a CreateFolderCommand", () => {
    expect(handler.canHandle(command)).toBe(true);
  });

  it("should create the folder", () => {
    // Arrange
    const mkdirSpy = jest.spyOn(fs, "mkdirSync");
    mkdirSpy.mockImplementation((_) => {
      return "";
    });

    // Act
    const result = handler.handle(command);

    // Assert
    expect(result.type).toBe(CommandHandleResultType.Success);
    expect(mkdirSpy).toHaveBeenCalledWith(
      path.join(command.location, command.folderName)
    );
  });
});

describe("CreateFolderCommandValidator", () => {
  it("can validate a CreateFolderCommand", () => {
    expect(validator.canValidate(command)).toBe(true);
  });

  it("returns an error if the folder name is blank", () => {
    const existsSpy = jest.spyOn(fs, "existsSync");
    existsSpy.mockImplementation(() => true);

    const result = validator.validate({ ...command, folderName: "" });

    expect(result.isSuccess).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toBe("Folder name cannot be blank.");
  });

  it("returns an error if the location doesn't exist", () => {
    const existsSpy = jest.spyOn(fs, "existsSync");
    existsSpy.mockImplementation(() => false);

    const result = validator.validate(command);

    expect(result.isSuccess).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toBe("Location doesn't exist.");

    expect(existsSpy).toHaveBeenCalled();
  });
});
