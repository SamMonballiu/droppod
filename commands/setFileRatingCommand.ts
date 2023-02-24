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
import storage from "node-persist";
import { ratings } from "../ratings";

export class SetFileRatingCommand implements Command {
  public filename: string;
  public rating: FileRating;

  constructor(filename: string, rating: FileRating) {
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
      ratings.remove(command.filename);
    } else {
      ratings.set(command.filename, rating);
    }

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
    if (!fs.existsSync(config.basePath + command.filename)) {
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
