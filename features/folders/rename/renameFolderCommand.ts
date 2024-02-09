import {
  Command,
  CommandHandler,
  CommandHandleResult,
  CommandValidateResult,
  CommandValidator,
} from "@commands";
import { qualify } from "@config";
import fs from "fs-extra";
import { RatingsService } from "../../../ratings";
import { FilesCache } from "../../files/files-cache";
import path from "path";

export class RenameFolderCommand implements Command {
  public parentPath: string;
  public currentName: string;
  public newName: string;

  constructor(parentPath: string, currentName: string, newName: string) {
    this.parentPath = parentPath;
    this.currentName = currentName;
    this.newName = newName;
  }
}

export class RenameFolderCommandValidator
  implements CommandValidator<RenameFolderCommand>
{
  public canValidate = (command: Command) =>
    command instanceof RenameFolderCommand;
  public validate(command: RenameFolderCommand) {
    const currentPath = qualify(command.parentPath, command.currentName);
    const newPath = qualify(command.parentPath, command.newName);

    if (!fs.existsSync(currentPath)) {
      return CommandValidateResult.Error(
        `No folder named '${command.currentName}' could be found in the specified path.`
      );
    }

    if (fs.existsSync(newPath)) {
      return CommandValidateResult.Error(
        `A folder named '${command.newName}' already exists in the specified path.`
      );
    }

    return CommandValidateResult.Success();
  }
}

export class RenameFolderCommandHandler
  implements CommandHandler<RenameFolderCommand>
{
  private _filesCache: FilesCache;
  private _ratings: RatingsService;

  constructor(filesCache: FilesCache, ratings: RatingsService) {
    this._filesCache = filesCache;
    this._ratings = ratings;
  }

  public canHandle = (command: Command) =>
    command instanceof RenameFolderCommand;

  public handle(command: RenameFolderCommand) {
    try {
      const currentPath = qualify(command.parentPath, command.currentName);
      const newPath = qualify(command.parentPath, command.newName);

      fs.renameSync(currentPath, newPath);

      this._filesCache.invalidate(command.parentPath);

      this._ratings.transferFolder(
        path.join("/", command.parentPath, command.currentName),
        path.join("/", command.parentPath, command.newName)
      );

      return CommandHandleResult.Success.WithoutResult();
    } catch (err: any) {
      return CommandHandleResult.Error(err.toString());
    }
  }
}
