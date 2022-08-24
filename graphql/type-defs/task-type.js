import {gql} from "apollo-server"

export const TaskType = gql`
    extend type Query {
        getTaskListByManager(accessToken: String!, status: TaskStatus!): [Task]
        getTaskListByWorkerId(accessToken: String!, status: TaskStatus!): [Task]
        getTaskDetailById(taskId: String!, accessToken: String!): Task
        getCommentByTaskId(taskId: String!, accessToken: String!): [Comment]
    }

    extend type Mutation {
        createTaskByManagerId(taskInput: createTaskInput!, accessToken: String!): String!
        allocateTaskByManagerId(accessToken: String!,taskInput: updateTaskInput! ): String!
        removeTaskByManagerId(taskId: String!, accessToken: String!): String
        createComment(commentInput: createCommentInput!, accessToken: String!): String
        removeCommentById(accessToken: String!, commentId: String!): String
        changeTaskStatusByWorker(taskId: String!, accessToken: String!, status: TaskStatus!): String

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