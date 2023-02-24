import { Response } from "express";
import {
  CreateFolderCommandHandler,
  CreateFolderCommandValidator,
} from "./createFolderCommand";
import {
  SetFileRatingCommandHandler,
  SetFileRatingCommandValidator,
} from "./setFileRatingCommand";

export interface Command {}

export interface CommandHandler<T extends Command> {
  handle: (command: T) => Promise<CommandHandleResult> | CommandHandleResult;
  canHandle: (command: T) => boolean;
}

export interface CommandValidator<T extends Command> {
  validate: (command: T) => CommandValidateResult;
  canValidate: (command: T) => boolean;
}

export enum CommandHandleResultType {
  None,
  Success,
  NotFound,
  ValidationError,
  Error,
}
export class CommandHandleResult {
  public type: CommandHandleResultType;
  public message?: string;

  private constructor(type: CommandHandleResultType, message?: string) {
    this.type = type;
    this.message = message;
  }

  public static get Success() {
    return new CommandHandleResult(CommandHandleResultType.Success);
  }

  public static NotFound(message?: string) {
    return new CommandHandleResult(CommandHandleResultType.NotFound, message);
  }

  public static ValidationError(message: string) {
    return new CommandHandleResult(
      CommandHandleResultType.ValidationError,
      message
    );
  }

  public static Error(message: string) {
    return new CommandHandleResult(CommandHandleResultType.Error, message);
  }
}

export class CommandValidateResult {
  public errors: string[];

  public constructor(errors: string[]) {
    this.errors = errors;
  }

  public get isSuccess() {
    return this.errors.length === 0;
  }

  public static Success = () => new CommandValidateResult([]);
}

export class CommandHandlerFactory {
  private readonly validators: CommandValidator<any>[];
  private readonly handlers: CommandHandler<any>[];

  constructor() {
    this.validators = [
      new CreateFolderCommandValidator(),
      new SetFileRatingCommandValidator(),
    ];
    this.handlers = [
      new CreateFolderCommandHandler(),
      new SetFileRatingCommandHandler(),
    ];
  }

  public async handle(command: Command): Promise<CommandHandleResult> {
    const validator = this.validators.find((x) => x.canValidate(command));
    const handler = this.handlers.find((x) => x.canHandle(command));

    if (validator !== undefined) {
      const { errors, isSuccess } = validator.validate(command);
      if (!isSuccess) {
        return CommandHandleResult.ValidationError(errors.join("\n"));
      }
    }

    return handler !== undefined
      ? handler.handle(command)
      : CommandHandleResult.Error(
          "Couldn't find a handler for a command of this type."
        );
  }
}

export const handleResult = (result: CommandHandleResult, res: Response) => {
  const { Success, NotFound, ValidationError, Error } = CommandHandleResultType;
  switch (result.type) {
    case Success:
      res.status(200).send();
      break;
    case NotFound:
      res.status(404).send(result.message);
      break;
    case ValidationError:
      res.status(400).send(result.message);
      break;
    case Error:
      res.status(500).send(result.message);
      break;
  }
};
