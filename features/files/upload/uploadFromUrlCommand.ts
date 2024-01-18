import { Command, CommandHandler, CommandHandleResult } from "@commands";
import { FilesCache } from "../files-cache";
import fs from "fs-extra";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { qualify } from "@config";

const extractFilenameFromURL = (url: string): string | undefined => {
  const urlParts = url.split("/");
  const lastPart = urlParts[urlParts.length - 1];
  const filename = lastPart.split("?")[0];
  return filename || undefined;
};

export class UploadFromUrlCommand implements Command {
  public url: string;
  public folder: string;
  public newName?: string;

  constructor(url: string, folder: string, newName?: string) {
    this.url = url;
    this.folder = folder;
    this.newName = newName;
  }
}

export class UploadFromUrlCommandHandler
  implements CommandHandler<UploadFromUrlCommand>
{
  private _filesCache: FilesCache;

  constructor(filesCache: FilesCache) {
    this._filesCache = filesCache;
  }

  public canHandle = (command: Command) =>
    command instanceof UploadFromUrlCommand;

  public async handle(command: UploadFromUrlCommand) {
    try {
      let writePath: string = "";

      if (command.newName) {
        writePath = qualify(command.folder, command.newName);
      } else {
        const filename = extractFilenameFromURL(command.url);
        if (!filename) {
          return CommandHandleResult.Error("Couldn't determine a filename");
        }
        writePath = qualify(command.folder, filename);
      }

      const stream = fs.createWriteStream(writePath);
      const { body } = await fetch(command.url);

      if (body !== null) {
        //@ts-ignore
        await finished(Readable.fromWeb(body).pipe(stream));
        return CommandHandleResult.Success.WithoutResult();
      }

      this._filesCache.invalidate(command.folder);

      return CommandHandleResult.Error("Not yet implemented");
    } catch (err) {
      return CommandHandleResult.Error("Not yet implemented");
    }
  }
}
