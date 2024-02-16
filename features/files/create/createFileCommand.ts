import {
  Command,
  CommandHandler,
  CommandHandleResult,
  CommandValidateResult,
  CommandValidator,
} from "@commands";
import { qualify } from "@config";
import fs from "fs";
import { FilesCache } from "../files-cache";

export class CreateFileCommand implements Command {
  public location: string;
  public filename: string;
  public contents: string;

  public get fullPath() {
    return qualify(this.filename);
  }

  constructor(location: string, filename: string, contents: string) {
    this.location = location;
    this.filename = filename;
    this.contents = contents;
  }
}

export class CreateFileCommandValidator
  implements CommandValidator<CreateFileCommand>
{
  public canValidate = (c: Command) => c instanceof CreateFileCommand;

  public validate(command: CreateFileCommand) {
    if (!fs.existsSync(command.location)) {
      return CommandValidateResult.Error("Location doesn't exist.");
    }

    if (command.filename === "") {
      return CommandValidateResult.Error("Filename must be supplied.");
    }

    // if (fs.existsSync(command.fullPath)) {
    //   return CommandValidateResult.Error(
    //     "A file with this name already exists in this folder."
    //   );
    // }

    return CommandValidateResult.Success();
  }
}

export class CreateFileCommandHandler
  implements CommandHandler<CreateFileCommand>
{
  private _filesCache: FilesCache;

  constructor(filesCache: FilesCache) {
    this._filesCache = filesCache;
  }

  public canHandle = (c: Command) => c instanceof CreateFileCommand;

  public handle(command: CreateFileCommand) {
    try {
      fs.writeFileSync(command.fullPath, command.contents);
      this._filesCache.invalidate(command.location);
      return CommandHandleResult.Success.WithoutResult();
    } catch (err: any) {
      return CommandHandleResult.Error(
        "An error occurred.\n" + err?.toString()
      );
    }
  }
}
