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
import { ratings } from "../ratings";
import { filesCache } from "../files-cache";
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
  public canHandle = (command: Command) =>
    command instanceof SetFileRatingCommand;

  public async handle(command: SetFileRatingCommand) {
    const rating = command.rating;

    if (rating === 0) {
      ratings.remove(path.join(command.path, command.filename));
    } else {
      ratings.set(path.join(command.path, command.filename), rating);
    }

    filesCache.invalidate(command.path);

    return CommandHandleResult.Success;
  }
}

export class SetFileRatingCommandValidator
  implements CommandValidator<SetFileRatingCommand>
{
  public canValidate = (command: Command) =>
    command instanceof SetFileRatingCommand;

  public validate = (command: SetFileRatingCommand) => {
    let errors = [];
    if (
      !fs.existsSync(path.join(config.basePath, command.path, command.filename))
    ) {
      errors.push(
        "The specified file could not be found: ",
        config.basePath + command.filename
      );
    }

    return errors.length > 0
      ? new CommandValidateResult(errors)
      : CommandValidateResult.Success();
  };
}
