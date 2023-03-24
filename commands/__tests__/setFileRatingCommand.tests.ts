import { filesCache } from "../../files-cache";
import { CommandHandleResultType } from "../base";
import {
  SetFileRatingCommand,
  SetFileRatingCommandHandler,
} from "../setFileRatingCommand";
import { mockRatings } from "../mocks";

const command = new SetFileRatingCommand("path", "filename", 5);

const handler = new SetFileRatingCommandHandler(mockRatings, filesCache);
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
