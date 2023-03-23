import {
  Command,
  CommandHandler,
  CommandHandleResult,
  CommandValidateResult,
  CommandValidator,
} from "./base";
import fs from "fs-extra";
import path from "path";
import { config, qualify } from "../config";
import { FilesCache, filesCache } from "../files-cache";

export class MoveFilesCommand implements Command {
  public location: string;
  public filenames: string[];
  public destination: string;
  public filesCache: FilesCache;

  constructor(
    location: string,
    filenames: string[],
    destination: string,
    filesCache: FilesCache
  ) {
    this.location = location;
    this.filenames = filenames;
    this.destination = destination;
    this.filesCache = filesCache;
  }
}

export class MoveFilesCommandValidator
  implements CommandValidator<MoveFilesCommand>
{
  public canValidate = (command: MoveFilesCommand) =>
    command instanceof MoveFilesCommand;

  public validate(command: MoveFilesCommand) {
    let errors: string[] = [];

    if (!fs.existsSync(qualify(command.location))) {
      errors.push("Location doesn't exist.");
    }

    for (const filename of command.filenames) {
      const filePath = qualify(command.location, filename);
      if (!fs.existsSync(filePath)) {
        errors.push(`${filePath} doesn't exist.`);
      }
    }

    if (!fs.existsSync(qualify(command.destination))) {
      errors.push("Destination doesn't exist.");
    }

    return errors.length > 0
      ? new CommandValidateResult(errors)
      : CommandValidateResult.Success();
  }
}

export class MoveFilesCommandHandler
  implements CommandHandler<MoveFilesCommand>
{
  public canHandle = (command: Command) => command instanceof MoveFilesCommand;

  public handle(command: MoveFilesCommand) {
    try {
      for (const filename of command.filenames) {
        const currentPath = qualify(command.location, filename);
        const newPath = qualify(command.destination, filename);
        fs.moveSync(currentPath, newPath, { overwrite: true });
      }

      filesCache.invalidate(command.location);
      filesCache.invalidate(command.destination);
      return CommandHandleResult.Success.WithoutResult();
    } catch (err: any) {
      return CommandHandleResult.Error("Error: " + err.toString());
    }
  }
}
