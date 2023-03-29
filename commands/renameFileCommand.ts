import {
  Command,
  CommandHandler,
  CommandHandleResult,
  CommandValidateResult,
  CommandValidator,
} from "./base";
import fs from "fs-extra";
import { qualify } from "../config";
import { fdir } from "fdir";
import { FilesCache } from "../files-cache";

export class RenameFileCommand implements Command {
  public path: string;
  public currentName: string;
  public newName: string;

  constructor(path: string, currentName: string, newName: string) {
    this.path = path;
    this.currentName = currentName;
    this.newName = newName;
  }
}

export class RenameFileCommandValidator
  implements CommandValidator<RenameFileCommand>
{
  public canValidate = (command: Command) =>
    command instanceof RenameFileCommand;

  public validate(command: RenameFileCommand) {
    if (!fs.existsSync(qualify(command.path, command.currentName))) {
      return CommandValidateResult.Error(
        `No file with the name '${command.currentName}' could be found in the specified path.`
      );
    }

    const files = new fdir({ maxDepth: 0, relativePaths: true })
      .crawl(qualify(command.path))
      .sync();

    if (files.some((f) => f === command.newName)) {
      return CommandValidateResult.Error(
        `A file with the name '${command.newName}' already exists in the specified path.`
      );
    }

    return CommandValidateResult.Success();
  }
}

export class RenameFileCommandHandler
  implements CommandHandler<RenameFileCommand>
{
  private _filesCache: FilesCache;

  constructor(filesCache: FilesCache) {
    this._filesCache = filesCache;
  }

  public canHandle = (command: Command) => command instanceof RenameFileCommand;

  public handle(command: RenameFileCommand) {
    try {
      fs.renameSync(
        qualify(command.path, command.currentName),
        qualify(command.path, command.newName)
      );

      this._filesCache.invalidate(command.path);

      return CommandHandleResult.Success.WithoutResult();
    } catch (err: any) {
      return CommandHandleResult.Error(err.toString());
    }
  }
}
