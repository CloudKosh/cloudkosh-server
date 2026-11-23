import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import NamespaceContent from "./NamespaceContent.js";
import NamespaceStorage from "./NamespaceStorage.js";

@Table("StorageContents")
export default class StorageContent {

    @Column({ dataType: "BigInt", key: true})
    @RelateTo(NamespaceContent, {
        property: (x) => x.content,
        inverseProperty: (x) => x.storageContents,
        foreignKeyConstraint: {
            name: "FC_StorageContent_ContentID",
            onDelete: "cascade"
        }
    })
    contentID: number;
    
    @Column({ dataType: "BigInt", key: true})
    @RelateTo(NamespaceStorage, {
        property: (x) => x.storage,
        inverseProperty: (x) => x.storageContents,
        foreignKeyConstraint: {
            name: "FC_StorageContent_StorageID",
            onDelete: "restrict"
        }
    })
    storageID: number;

    @Column({ dataType: "Boolean", default: () => false })
    ready: boolean;

    content: NamespaceContent;
    storage: NamespaceStorage;

}