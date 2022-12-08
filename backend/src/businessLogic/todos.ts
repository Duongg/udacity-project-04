import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import * as uuid from 'uuid'
import { TodosAccess } from "../dataLayer/todosAccess";
import { TodoItem } from "../models/TodoItem";
import { parseUserId } from "../auth/utils";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { TodoUpdate } from "../models/TodoUpdate";

const todoAccess = new TodosAccess();
export function createTodo(createTodoRequest: CreateTodoRequest, jwtToken: string) {
    const userId = parseUserId(jwtToken);
    const todoId = uuid.v4();
    const s3BucketName = process.env.S3_BUCKET_NAME
    return todoAccess.createToDo({
        userId: userId,
        todoId: todoId,
        attachmentUrl:  `https://${s3BucketName}.s3.amazonaws.com/${todoId}`, 
        createdAt: new Date().getTime().toString(),
        done: false,
        ...createTodoRequest,
    });
    
}

export function getAllToDo(jwtToken: string): Promise<TodoItem[]> {
    return todoAccess.getAllToDo(parseUserId(jwtToken));
}

export function updateTodo(updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate> {
    return todoAccess.updateToDo(updateTodoRequest, todoId, parseUserId(jwtToken));
}

export function deleteToDo(todoId: string, jwtToken: string): Promise<string>{
    return todoAccess.deleteToDo(todoId, parseUserId(jwtToken));
}

export function generateUploadUrl(todoId: string): Promise<string>{
    return todoAccess.generateUploadUrl(todoId);
}