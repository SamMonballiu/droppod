import {
  Command,
  CommandHandler,
  CommandHandleResult,
  CommandValidator,
  CommandValidateResult,
} from "@commands";
import { FilesCache } from "../../files/files-cache";
import fs from "fs-extra";
import { qualify } from "@config";

export class DeleteFolderCommand implements Command {
  public parentPath: string;
  public folderName: string;

  constructor(path: string, folderName: string) {
    this.parentPath = path;
    this.folderName = folderName;
  }
}

export class DeleteFolderCommandValidator
  implements CommandValidator<DeleteFolderCommand>
{
  public canValidate = (command: Command) =>
    command instanceof DeleteFolderCommand;

  public validate(command: DeleteFolderCommand) {
    if (
      !fs.existsSync(qualify(command.parentPath)) ||
      !fs.existsSync(qualify(command.parentPath, command.folderName))
    ) {
      return CommandValidateResult.Error(
        `The specified folder could not be found.`
      );
    }

    return CommandValidateResult.Success();
  }
}

export class DeleteFolderCommandHandler
  implements CommandHandler<DeleteFolderCommand>
{
  private _filesCache: FilesCache;

  constructor(filesCache: FilesCache) {
    this._filesCache = filesCache;
  }

  public canHandle = (command: Command) =>
    command instanceof DeleteFolderCommand;

  public handle(command: DeleteFolderCommand) {
    try {
      fs.removeSync(qualify(command.parentPath, command.folderName));
      this._filesCache.invalidate(command.parentPath);
      return CommandHandleResult.Success.WithoutResult();
    } catch (err: any) {
      return CommandHandleResult.Error(err.toString());
    }
  }
}
