'use strict';

const AWS = require('aws-sdk');
const SQS = new AWS.SQS({ apiVersion: '2012-11-05' });
const CODEPIPELINE = new AWS.CodePipeline();

// TODO add your queue URL here
const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/**YOUR-SQS-QUEUE-URL-GOES-HERE**';

function process(message, callback) {
    console.log(message);
    
    var messageBody = JSON.parse(message.Body);
    var codePipelineMessage = JSON.parse(messageBody.Message);
    console.log(codePipelineMessage);

    var params = {
      actionName: codePipelineMessage.approval.actionName,
      pipelineName: codePipelineMessage.approval.pipelineName,
      result: { 
        status: 'Approved',
        summary: '**AUTO APPROVAL** From Lambda Function...'
      },
      stageName: codePipelineMessage.approval.stageName,
      token: codePipelineMessage.approval.token
    };
    CODEPIPELINE.putApprovalResult(params, function(err, data) {
      if (err){
        console.log(err, err.stack);   
      } else {
        console.log(data);
      }
    });
    console.log("Processed Successfully");

    // delete message
    const sqsParams = {
        QueueUrl: QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
    };
    SQS.deleteMessage(sqsParams, (err) => callback(err, message));
}

function poll(callback) {
    const params = {
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 5,
        VisibilityTimeout: 5,
    };
    // batch request messages
    SQS.receiveMessage(params, function(err, data) {
        if (err) {
            return callback(err);
        }
        if(data.Messages){
            // for each message, reinvoke the function
            const promises = data.Messages.map((message) => process(message, callback));
            // complete when all invocations have been made
            Promise.all(promises).then(() => {
                const result = `Messages received: ${data.Messages.length}`;
                console.log(result);
                callback(null, result);
            });
        }else{
            console.log("No messages");
            callback(null, "No Messages.");
        }
    });
}

exports.handler = (event, context, callback) => {
    try {
        poll(callback);
    } catch (err) {
        callback(err);
    }
};
