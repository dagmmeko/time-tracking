import {gql} from "apollo-server"

export const FileType = gql`
    extend type Query{
        getFile(fileType: FileType, fileId: String): String
    }
    extend type Mutation {
        createFile(fileType: FileType!): FileOutput
        fileUploadSuccess(fileType: FileType, collectionId: String!, fileId: String): String
    }

    type FileOutput {
        url: String
        file_id: String
    }

    enum FileType {
        ACCOUNT
        TASK
        COMMENT
    }
`  