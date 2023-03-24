import { filesCache } from "../../files-cache";
import { CommandHandleResultType } from "../base";
import {
  SetFileRatingCommand,
  SetFileRatingCommandHandler,
  SetFileRatingCommandValidator,
} from "../setFileRatingCommand";
import { mockRatings } from "../mocks";
import fs from "fs";

const command = new SetFileRatingCommand("path", "filename", 5);
const validator = new SetFileRatingCommandValidator();
const handler = new SetFileRatingCommandHandler(mockRatings, filesCache);

describe("SetFileRatingCommandValidator", () => {
  it("can validate a SetFileRatingCommand", () => {
    expect(validator.canValidate(command)).toBe(true);
  });

  it("returns an error if the file does not exist", () => {
    const existsSpy = jest
      .spyOn(fs, "existsSync")
      .mockImplementation(() => false);

    const result = validator.validate(command);

    expect(result.isSuccess).toBe(false);
    expect(result.errors[0]).toBe(
      "The specified file could not be found: filename"
    );
    existsSpy.mockRestore();
  });
});

describe("SetFileRatingCommandHandler", () => {
  it("can handle a SetFileRatingCommand", () => {
    expect(handler.canHandle(command)).toBe(true);
  });

  it("invalidates the files cache for the supplied path", (doneFn) => {
    const invalidate = jest
      .spyOn(filesCache, "invalidate")
      .mockImplementation(() => {
        return;
      });

    handler.handle(command).then(() => {
      expect(invalidate).toHaveBeenCalled();
      invalidate.mockRestore();
      doneFn();
    });
  });

  it("removes an existing rating if the command's rating is 0", (doneFn) => {
    const removeRating = jest.spyOn(mockRatings, "remove");

    handler.handle({ ...command, rating: 0 }).then((result) => {
      expect(result.type).toBe(CommandHandleResultType.Success);
      expect(removeRating).toHaveBeenCalled();
      removeRating.mockRestore();
      doneFn();
    });
  });

  it("sets the rating if the command's rating is not 0", (doneFn) => {
    const setRating = jest.spyOn(mockRatings, "set");

    handler.handle(command).then((result) => {
      expect(result.type).toBe(CommandHandleResultType.Success);
      expect(setRating).toHaveBeenCalled();
      setRating.mockRestore();
      doneFn();
    });
  });
});
