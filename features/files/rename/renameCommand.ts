import {
  Command,
  CommandHandler,
  CommandHandleResult,
  CommandValidateResult,
  CommandValidator,
} from "../../../commands/base";
import fs from "fs-extra";
import { qualify } from "../../../config";
import { FilesCache } from "../files-cache";

export class RenameCommand implements Command {
  public path: string;
  public currentName: string;
  public newName: string;

  constructor(path: string, currentName: string, newName: string) {
    this.path = path;
    this.currentName = currentName;
    this.newName = newName;
  }
}

export class RenameCommandValidator implements CommandValidator<RenameCommand> {
  public canValidate = (command: Command) => command instanceof RenameCommand;

  public validate(command: RenameCommand) {
    if (!fs.existsSync(qualify(command.path, command.currentName))) {
      return CommandValidateResult.Error(
        `No file with the name '${command.currentName}' could be found in the specified path.`
      );
    }

    if (fs.existsSync(qualify(command.path, command.newName))) {
      return CommandValidateResult.Error(
        `A file or folder with the name '${command.newName}' already exists in the specified path.`
      );
    }

    return CommandValidateResult.Success();
  }
}

export class RenameCommandHandler implements CommandHandler<RenameCommand> {
  private _filesCache: FilesCache;

  constructor(filesCache: FilesCache) {
    this._filesCache = filesCache;
  }

  public canHandle = (command: Command) => command instanceof RenameCommand;

  public handle(command: RenameCommand) {
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
