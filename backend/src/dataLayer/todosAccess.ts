import * as AWS from 'aws-sdk';
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
import { Types } from 'aws-sdk/clients/s3';

const logger = createLogger('TodosAccess')
export class TodosAccess{
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly s3Client: Types = new AWS.S3({signatureVersion: 'v4'}),
        private readonly s3BucketName = process.env.S3_BUCKET_NAME
    ){}
    async getAllToDo(userId: string): Promise<TodoItem[]> { 
        logger.info(`Get all todos for user with id ${userId}`)
        const params = {
            TableName: this.todoTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        };

        const result = await this.docClient.query(params).promise();
        console.log(result);
        const items = result.Items;

        return items as TodoItem[];
    }

    async createToDo(todoItem: TodoItem){
        logger.info(`Create new todo for user with id: ${todoItem.userId}`)
        const params = {
            TableName: this.todoTable,
            Item: todoItem,
        };

        const result = await this.docClient.put(params).promise();
        console.log(result);

        return todoItem as TodoItem;
    }

    async updateToDo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
        

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #a = :a, #b = :b, #c = :c",
            ExpressionAttributeNames: {
                "#a": "name",
                "#b": "dueDate",
                "#c": "done"
            },
            ExpressionAttributeValues: {
                ":a": todoUpdate['name'],
                ":b": todoUpdate['dueDate'],
                ":c": todoUpdate['done']
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await this.docClient.update(params).promise();
        logger.info(`Update result: ${result}`)
        const attributes = result.Attributes;

        return attributes as TodoUpdate;
    }

    async deleteToDo(todoId: string, userId: string): Promise<string> {
        logger.info("Deleting todos with id: ${todoId} of user with userId: ${userId}");

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        const result = await this.docClient.delete(params).promise();
        logger.info(`Result: ${result}`)
        

        return "" as string;
    }

    async generateUploadUrl(todoId: string): Promise<string> {
        logger.info(`Generating url`)

        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: 1000,
        });
        logger.info(`Result url: ${url}`)

        return url as string;
    }
}