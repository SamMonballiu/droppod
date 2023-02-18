import {
  Command,
  CommandHandler,
  CommandHandleResult,
  CommandValidateResult,
  CommandValidator,
} from "./base";
import fs from "fs";
import path from "path";

export class CreateFolderCommand implements Command {
  public location: string;
  public folderName: string;

  constructor(location: string, folderName: string) {
    this.location = location;
    this.folderName = folderName;
  }
}

export class CreateFolderCommandHandler
  implements CommandHandler<CreateFolderCommand>
{
  public canHandle = (command: Command) =>
    command instanceof CreateFolderCommand;

  public handle(command: CreateFolderCommand) {
    try {
      const folder = path.join(command.location, command.folderName);
      fs.mkdirSync(folder);

      return CommandHandleResult.Success;
    } catch {
      return CommandHandleResult.Error("Something went wrong.");
    }
  }
}

export class CreateFolderCommandValidator
  implements CommandValidator<CreateFolderCommand>
{
  public canValidate = (command: CreateFolderCommand) =>
    command instanceof CreateFolderCommand;

  public validate(command: CreateFolderCommand) {
    if (command.folderName === "") {
      return new CommandValidateResult(["Folder name cannot be blank."]);
    }

    return CommandValidateResult.Success();
  }
}
