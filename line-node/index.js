"use strict";
const line = require("@line/bot-sdk");
const AWS = require("aws-sdk");
const client = new line.Client({ channelAccessToken: process.env.ACCESSTOKEN });
const s3 = new AWS.S3();
const expiresTime = 3600;

exports.handler = async (event, context, callback) => {
  const data = event.events[0];
  const type = data.type;
  const message = data.message;
  const message_type = message.type;
  const message_id = message.id;
  const message_text = message.text;
  const replyToken = data.replyToken;
  const source = data.source;
  const source_type = source.type;
  const source_userId = source.userId;
  const timestamp = data.timestamp;
  const mode = data.mode;

  let replyTextEvent = {
    type: "text",
    id: message_id,
    text: `tmp`,
  };

  switch (message_type) {
    case "image":
    case "audio":
      const s3ObjectUrl = await getS3ObjectUrl(message_id, message_type);
      replyTextEvent.text = `${s3ObjectUrl}`;
      break;
    case "text":
      replyTextEvent.text = message_text;
      break;
    default:
      replyTextEvent.text = `File uploaded error. ${message_type}`;
      break;
  }
  await client.replyMessage(replyToken, replyTextEvent);
};

async function getS3ObjectUrl(message_id, message_type) {
  let extension = "";
  switch (message_type) {
    case "image":
      extension = "jpg";
      break;
    case "text":
      extension = "txt";
      break;
    case "audio":
      extension = "m4a";
      break;
    default:
      return "";
  }
  try {
    const stream = await client.getMessageContent(message_id);
    const buffer = await getStreamBuffer(stream);
    const params = {
      Bucket: process.env.IMAGE_BUCKET_NAME,
      Key: `${message_id}.${extension}`,
      Body: buffer,
    };
    await s3.putObject(params).promise();
    const publicUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.IMAGE_BUCKET_NAME,
      Key: `${message_id}.${extension}`,
      Expires: expiresTime,
    });
    return publicUrl;
  } catch (err) {
    console.log(err);
    return "";
  }
}

async function getStreamBuffer(stream) {
  //convert stream to buffer
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });
    stream.on("error", reject);
  });
}
