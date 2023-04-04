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

export class DeleteCommand implements Command {
  public path: string;
  public itemName: string;

  constructor(path: string, itemName: string) {
    this.path = path;
    this.itemName = itemName;
  }
}

export class DeleteCommandValidator implements CommandValidator<DeleteCommand> {
  public canValidate = (command: Command) => command instanceof DeleteCommand;

  public validate(command: DeleteCommand) {
    if (!fs.existsSync(qualify(command.path, command.itemName))) {
      return CommandValidateResult.Error(
        `No file or folder with the name '${command.itemName}' could be found in the specified path.`
      );
    }

    return CommandValidateResult.Success();
  }
}

export class DeleteCommandHandler implements CommandHandler<DeleteCommand> {
  private _filesCache: FilesCache;

  constructor(filesCache: FilesCache) {
    this._filesCache = filesCache;
  }

  public canHandle = (command: Command) => command instanceof DeleteCommand;

  public handle(command: DeleteCommand) {
    try {
      fs.removeSync(qualify(command.path, command.itemName));
      this._filesCache.invalidate(command.path);
      return CommandHandleResult.Success.WithoutResult();
    } catch (err: any) {
      return CommandHandleResult.Error(err.toString());
    }
  }
}
