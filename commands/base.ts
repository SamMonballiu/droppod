import { Response } from "express";
import {
  CreateFolderCommandHandler,
  CreateFolderCommandValidator,
} from "./createFolderCommand";
import {
  MoveFilesCommandHandler,
  MoveFilesCommandValidator,
} from "./moveFilesCommand";
import {
  SetFileRatingCommandHandler,
  SetFileRatingCommandValidator,
} from "./setFileRatingCommand";

export interface Command {}

export interface CommandHandler<T extends Command, TResult = undefined> {
  handle: (
    command: T
  ) => Promise<CommandHandleResult<TResult>> | CommandHandleResult<TResult>;
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
export class CommandHandleResult<T> {
  public type: CommandHandleResultType;
  public message?: string;
  public result?: T;

  private constructor(
    result: T,
    type: CommandHandleResultType,
    message?: string
  ) {
    this.result = result;
    this.type = type;
    this.message = message;
  }

  public static get Success() {
    return {
      WithoutResult: () =>
        new CommandHandleResult(undefined, CommandHandleResultType.Success),
      WithResult: <T>(result: T) =>
        new CommandHandleResult(result, CommandHandleResultType.Success),
    };
  }

  public static NotFound(message?: string) {
    return new CommandHandleResult(
      undefined,
      CommandHandleResultType.NotFound,
      message
    );
  }

  public static ValidationError(message: string) {
    return new CommandHandleResult(
      undefined,
      CommandHandleResultType.ValidationError,
      message
    );
  }

  public static Error(message: string) {
    return new CommandHandleResult(
      undefined,
      CommandHandleResultType.Error,
      message
    );
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

  public static Error = (error: string) => new CommandValidateResult([error]);
}

export class CommandResponse<T> {
  public result: T;
  public message?: string;

  private constructor(result: T, message: string | undefined) {
    this.result = result;
    this.message = message;
  }

  public static FromResult<T>(response: CommandHandleResult<T>) {
    return new CommandResponse(response.result, response.message);
  }
}

export class CommandHandlerFactory {
  private readonly validators: CommandValidator<any>[];
  private readonly handlers: CommandHandler<any, any>[];

  constructor() {
    this.validators = [
      new CreateFolderCommandValidator(),
      new SetFileRatingCommandValidator(),
      new MoveFilesCommandValidator(),
    ];
    this.handlers = [
      new CreateFolderCommandHandler(),
      new SetFileRatingCommandHandler(),
      new MoveFilesCommandHandler(),
    ];
  }

  public async handle(command: Command): Promise<CommandHandleResult<unknown>> {
    try {
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
    } catch (err: unknown) {
      return CommandHandleResult.Error(
        `An error occurred: ${(err as Error).toString()}`
      );
    }
  }
}

export const handleResult = (
  result: CommandHandleResult<unknown>,
  res: Response
) => {
  const { Success, NotFound, ValidationError, Error } = CommandHandleResultType;
  const response = CommandResponse.FromResult(result);
  switch (result.type) {
    case Success:
      res.status(200).send(response);
      break;
    case NotFound:
    case ValidationError:
      res.status(404).send(response);
      break;
    case Error:
      res.status(500).send(response);
      break;
  }
};
