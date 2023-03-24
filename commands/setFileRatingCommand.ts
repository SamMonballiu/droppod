import { config } from "../config";
import { FileRating } from "../models/post";
import {
  Command,
  CommandHandler,
  CommandHandleResult,
  CommandValidateResult,
  CommandValidator,
} from "./base";
import fs from "fs";
import { RatingsService } from "../ratings";
import { FilesCache } from "../files-cache";
import path from "path";

export class SetFileRatingCommand implements Command {
  public path: string;
  public filename: string;
  public rating: FileRating;

  constructor(path: string, filename: string, rating: FileRating) {
    this.path = path;
    this.filename = filename;
    this.rating = rating;
  }
}

export class SetFileRatingCommandHandler
  implements CommandHandler<SetFileRatingCommand>
{
  public ratings: RatingsService;
  public filesCache: FilesCache;

  constructor(ratings: RatingsService, filesCache: FilesCache) {
    this.ratings = ratings;
    this.filesCache = filesCache;
  }

  public canHandle = (command: Command) =>
    command instanceof SetFileRatingCommand;

  public async handle(command: SetFileRatingCommand) {
    const rating = command.rating;

    if (rating === 0) {
      this.ratings.remove(path.join(command.path, command.filename));
    } else {
      this.ratings.set(path.join(command.path, command.filename), rating);
    }

    this.filesCache.invalidate(command.path);

    return CommandHandleResult.Success.WithoutResult();
  }
}

export class SetFileRatingCommandValidator
  implements CommandValidator<SetFileRatingCommand>
{
  public canValidate = (command: Command) =>
    command instanceof SetFileRatingCommand;

  public validate = (command: SetFileRatingCommand) => {
    if (
      !fs.existsSync(path.join(config.basePath, command.path, command.filename))
    ) {
      return CommandValidateResult.Error(
        "The specified file could not be found: " + command.filename
      );
    }

    return CommandValidateResult.Success();
  };
}
