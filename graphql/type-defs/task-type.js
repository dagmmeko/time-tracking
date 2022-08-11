import {gql} from "apollo-server"

export const TaskType = gql`
    extend type Query {

    }

    extend type Mutation {

    }

    enum TaskStatus {
        PAUSE
        START
        IN_PREVIEW
        COMPLETE
    }

    type Task {
        created_at: String!
        updated_at: String!
        deleted_at: String

        assigned_to: String
        name: String!
        description: String
        start_time: String
        deadline: String
        working_time: String
        # files
        status: TaskStatus

    }
    type Comment {
        created_at: String!
        updated_at: String!
        deleted_at: String

        commented_by: String
        comment: String
        task_id: String
        # files
    }
        
`