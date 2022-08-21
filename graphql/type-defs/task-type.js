import {gql} from "apollo-server"

export const TaskType = gql`
    extend type Query {
        getTaskListByManager(accountId: String!, accessToken: String!, status: TaskStatus!): [Task]
        getTaskListByWorkerId(accountId: String!, accessToken: String!, status: TaskStatus!): [Task]
        getTaskDetailById(taskId: String!, accessToken: String!, accountId: String!): Task
        getCommentByTaskId(taskId: String!, accessToken: String!, accountId: String!): [Comment]
    }

    extend type Mutation {
        createTaskByManagerId(taskInput: createTaskInput!, accountId: String!, accessToken: String!): String!
        allocateTaskByManagerId(accountId: String!, accessToken: String!,taskInput: updateTaskInput! ): String!
        removeTaskByManagerId(taskId: String!, accountId: String!, accessToken: String!): String
        createComment(commentInput: createCommentInput!, accountId: String!, accessToken: String!): String
        removeCommentById(accountId: String!, accessToken: String!, commentId: String!): String
        changeTaskStatusByWorker(taskId: String!, accountId: String!, accessToken: String!, status: TaskStatus!): String

    }

    input createTaskInput {
        task_name: String!
        assigned_to: [String!]

        task_description: String!
        task_due_date: String!
    }

    input updateTaskInput {
        task_id: String!
        task_name: String
        category: String
        assigned_to: [String]
        
        task_description: String
        task_due_date: String
    }

    type Task {
        created_at: String!
        updated_at: String
        deleted_at: String

        task_name: String!
        category: String!
        assigned_to: [String]
        
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
        comment_description: String
        task_id: String
        # files
    }
    input createCommentInput {
        comment_description: String!
        task_id: String!
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