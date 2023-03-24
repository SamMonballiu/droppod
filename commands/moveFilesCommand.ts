import {
  Command,
  CommandHandler,
  CommandHandleResult,
  CommandValidateResult,
  CommandValidator,
} from "./base";
import fs from "fs-extra";
import { qualify } from "../config";
import { FilesCache } from "../files-cache";

export class MoveFilesCommand implements Command {
  public location: string;
  public filenames: string[];
  public destination: string;

  constructor(location: string, filenames: string[], destination: string) {
    this.location = location;
    this.filenames = filenames;
    this.destination = destination;
  }
}

export class MoveFilesCommandValidator
  implements CommandValidator<MoveFilesCommand>
{
  public canValidate = (command: MoveFilesCommand) =>
    command instanceof MoveFilesCommand;

  public validate(command: MoveFilesCommand) {
    if (!fs.existsSync(qualify(command.location))) {
      return CommandValidateResult.Error("Location doesn't exist.");
    }

    if (!fs.existsSync(qualify(command.destination))) {
      return CommandValidateResult.Error("Destination doesn't exist.");
    }

    if (command.location === command.destination) {
      return CommandValidateResult.Error(
        "Location and destination are identical."
      );
    }

    let fileErrors: string[] = [];
    for (const filename of command.filenames) {
      const filePath = qualify(command.location, filename);
      if (!fs.existsSync(filePath)) {
        fileErrors.push(`${filePath} doesn't exist.`);
      }
    }

    if (fileErrors.length > 0) {
      return CommandValidateResult.Errors(fileErrors);
    }

    return CommandValidateResult.Success();
  }
}

export class MoveFilesCommandHandler
  implements CommandHandler<MoveFilesCommand>
{
  private _filesCache: FilesCache;

  constructor(filesCache: FilesCache) {
    this._filesCache = filesCache;
  }

  public canHandle = (command: Command) => command instanceof MoveFilesCommand;

  public handle(command: MoveFilesCommand) {
    try {
      for (const filename of command.filenames) {
        const currentPath = qualify(command.location, filename);
        const newPath = qualify(command.destination, filename);
        fs.moveSync(currentPath, newPath, { overwrite: true });
      }

      this._filesCache.invalidate(command.location);
      this._filesCache.invalidate(command.destination);
      return CommandHandleResult.Success.WithoutResult();
    } catch (err: any) {
      return CommandHandleResult.Error("Error: " + err.toString());
    }
  }
}
