import CheckConstraint from "@entity-access/entity-access/dist/decorators/CheckConstraint.js";
import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import { JsonProperty } from "@entity-access/server-pages/dist/services/ModelService.js";
import Namespace from "./Namespace.js";
import Bucket from "./Bucket.js";

const sourceTypes = [ "s3", "azure-blob", "cloud-kosh-ns", "cloud-kosh-bucket" ] as const;
export type sourceTypesType = typeof sourceTypes[number];

const statusTypes = [ "started", "failed", "completed" ] as const;
export type statusType = typeof statusTypes[number];


@Table("ImportTasks")
@CheckConstraint({
    name: "CC_Import_Tasks_Bucket_Or_Namespace",
    filter: (x) => (x.bucketID === null && x.namespaceID !== null)
        || (x.bucketID !== null && x.namespaceID === null)
})
export default class ImportTask {

    @Column({ dataType: "BigInt"})
    taskID: number;

    @Column({ dataType: "BigInt", nullable: true})
    @RelateTo(Bucket, {
        property: (x) => x.bucket,
        inverseProperty: (x) => x.importTasks
    })
    bucketID: number;

    @Column({ dataType: "BigInt", nullable: true})
    @RelateTo(Namespace, {
        property: (x) => x.namespace,
        inverseProperty: (x) => x.importTasks,
        foreignKeyConstraint: {
            name: "FC_ImportTasks_Namespace",
            onDelete:  "restrict"
        }
    })
    namespaceID: number;

    @Column({ dataType: "Char", enum: statusTypes, default: () => "started"})
    status: statusType;

    @Column({ dataType: "Char", nullable: true})
    nextToken: string;

    @Column({ dataType: "Char", length: 20, enum: sourceTypes})
    sourceType: sourceTypesType;

    @Column({ dataType: "Char", nullable: true})
    encryptedConnectionString: string;

    @Column({ dataType: "Char", nullable: true})
    region: string;

    @Column({ dataType: "Char", nullable: true})
    endpoint: string;

    @Column({ dataType: "Char", nullable: true})
    accessKeyID: string;

    @Column({ dataType: "Char", nullable: true})
    encryptedSecretAccessKey: string;

     @Column({ dataType: "Char", nullable: true})
    container: string;

    @JsonProperty({})
    connectionString: string;

    @JsonProperty({})
    secretAccessKey: string;

    namespace: Namespace;
    bucket: Bucket;

}