import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import Namespace from "./Namespace.js";
import User from "./User.js";

@Table("NamespaceUsers")
export default class NamespaceUser {

    @Column({ dataType: "BigInt", key: true})
    @RelateTo(Namespace, {
        property: (x) => x.namespace,
        inverseProperty: (x) => x.namespaceUsers,
        foreignKeyConstraint: {
            name: "FC_NamespaceUsers_NamespaceID",
            onDelete: "cascade"
        }
    })
    namespaceID: number;

    @Column({ dataType: "BigInt", key: true})
    @RelateTo(User, {
        property: (x) => x.user,
        inverseProperty: (x) => x.namespaceUsers,
        foreignKeyConstraint: {
            name: "FC_NamespaceUsers_UserID",
            onDelete: "cascade"
        }
    })
    userID: number;

    namespace: Namespace;
    user: User;

}