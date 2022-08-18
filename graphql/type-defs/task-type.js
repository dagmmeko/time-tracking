import {gql} from "apollo-server"

export const TaskType = gql`
    extend type Query {
        getTaskListByManager(accountId: String!, accessToken: String!, status: TaskStatus!): [Task]
        getTaskListByWorkerId(accountId: String!, accessToken: String!, status: TaskStatus!): [Task]
    }

    extend type Mutation {
        createTaskByManagerId(taskInput: createTaskInput!, accountId: String!, accessToken: String!): String!
        # allocateTaskByManagerId(): Task
        # removeTaskByManagerId(): Task
        # updateTaskStatus(): Task
        # createComment(): Comment
        # removeComment(): Comment
    }

    input createTaskInput {
        task_name: String!
        assigned_to: String!

        task_description: String!
        task_due_date: String!
    }

    type Task {
        created_at: String!
        updated_at: String
        deleted_at: String

        task_name: String!
        category: String!
        assigned_to: String
        
        task_description: String
        task_due_date: String
        created_by: String
        status: TaskStatus

        working_time: String
        # files
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

    enum TaskStatusManger {
        PAUSE
        START
        IN_PREVIEW
        COMPLETE
    }
    enum TaskStatus {
        NEW
        ACTIVE
        IN_PROGRESS
        UNDER_REVIEW
        COMPLETED
        DELETED
    }    
`