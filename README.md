# Approve CodePipeline using Lambda Function

Simple Lambda Function to approve CodePipeline action (Manual Approval). This can be used to have time-based auto-approval functionality in CodePipeline.

## Info

index.js is a Lambda function to be triggered by *CloudWatch Scheduled Event*. The Lambda function polls an SQS queue containing a CodePipeline Approval Notification. The lambda function approves the CodePipeline Approval event. 

You can achieve time-based autoapproval by following these two steps:

 CodePipeline -> Manual Approval -> SNS -> SQS
 CloudWatch Scheduled Event -> Lambda -> Poll SQS -> Auto Approve CodePipeline

## Instructions

1. Create a new Lambda Function
2. Ensure IAM Role has two permissions: SQS Read and Delete messages, and CodePipeline Approval permission.
3. Copy contents from index.js to Lambda function using AWS Lambda Inline Code Editor
4. Add a CloudWatch Scheduled Event trigger to your Lambda Function (select the appropriate time window that you want your codepipeline stage to get auto-approved)
