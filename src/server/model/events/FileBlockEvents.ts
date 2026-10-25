import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import FileBlock from "../entities/FileBlock.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";

export default class FileBlockEvents extends AuthenticatedEvents<FileBlock> {

    filter(query: IEntityQuery<FileBlock>): IEntityQuery<FileBlock> {
        if(!this.verify) {
            return query;
        }
        this.sessionUser.ensureLoggedIn();
        if(this.sessionUser.isAdmin) {
            return query;
        }
        return query
            .where(this.sessionUser,
                (x, p) =>
                    x.file.bucket.namespace.namespaceUsers.some(
                        (u) =>
                            u.userID === p.userID));
        
    }

    includeFilter(query: IEntityQuery<FileBlock>, type?: any, key?: string) {
        return query;
    }
}