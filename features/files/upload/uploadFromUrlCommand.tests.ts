import fs from "fs-extra";
import {
  UploadFromUrlCommand,
  UploadFromUrlCommandValidator,
} from "./uploadFromUrlCommand";

const command = new UploadFromUrlCommand(
  "www.mydomain.com/test.txt",
  "folder",
  "newFilename"
);
const validator = new UploadFromUrlCommandValidator();

describe("UploadFromUrlCommandValidator", () => {
  it("returns an error if the folder doesn't exist", () => {
    const existsSpy = jest
      .spyOn(fs, "existsSync")
      .mockImplementation(() => false);

    const result = validator.validate(command);

    expect(result.isSuccess).toBe(false);
    expect(result.errors[0]).toBe("Path does not exist: 'folder'.");
    expect(existsSpy).toHaveBeenCalled();
    existsSpy.mockRestore();
  });
});
