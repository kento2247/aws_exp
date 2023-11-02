"use strict";
const line = require("@line/bot-sdk");
const AWS = require("aws-sdk");
const qr = require("qrcode");
const client = new line.Client({ channelAccessToken: process.env.ACCESSTOKEN });
const s3 = new AWS.S3();
const expiresTime = 3600;

exports.handler = async (event, context, callback) => {
  console.log(event);
  if (event.hasOwnProperty("app_id") && event.hasOwnProperty("body")) {
    const app_id = event.app_id;
    const body = event.body;
    console.log(app_id, body);
  } else {
    if (event.hasOwnProperty("destination"))
      await linebot(event); //line botからのイベントと判断
    else
      console.log(
        "undefined event.\n(no app_id or no body)\n(no destination: not line bot event)"
      );
  }
};

async function linebot(event) {
  const data = event.events[0];
  const type = data.type;
  const replyToken = data.replyToken;

  if (type == "postback") {
    const postback_data = data.postback.data;
    const postback_params = data.postback.params;
    console.log(postback_data, postback_params);
    let replyEventObj = {
      type: "text",
      text: `params: ${postback_params}\ndata: ${postback_data}`,
    };
    await client.replyMessage(replyToken, replyEventObj);
  } else {
    const message = data.message;
    const message_type = message.type;
    const message_id = message.id;
    const message_text = message.text;
    const source = data.source;
    const source_type = source.type;
    const source_userId = source.userId;
    const timestamp = data.timestamp;
    const mode = data.mode;
    let replyEventObj = {
      type: "text",
      id: message_id,
      text: `tmp`,
    };

    switch (message_type) {
      case "image":
        let template = require("./flex-pointcard-template.json");
        const image_url = await getS3ObjectUrl_fromLine(
          message_id,
          message_type
        );
        replyEventObj = make_pointcard_replyEventObj(image_url, source_userId);
        break;
      case "audio":
        const s3ObjectUrl = await getS3ObjectUrl_fromLine(
          message_id,
          message_type
        );
        replyEventObj.text = `${s3ObjectUrl}`;
        break;
      case "text":
        if (message_text.includes("https://")) {
          const qrcode_url = await make_qrcode_s3url(message_id, message_text);
          replyEventObj = await make_pointcard_replyEventObj(
            qrcode_url,
            source_userId
          );
        } else {
          replyEventObj.text = message_text;
        }
        break;
      default:
        replyEventObj.text = `File uploaded error. ${message_type}`;
        break;
    }
    await client.replyMessage(replyToken, replyEventObj);
  }
}

async function getS3ObjectUrl_fromLine(message_id, message_type) {
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
    return await put_s3_obj(params);
  } catch (err) {
    console.log(err);
    return "";
  }
}

async function put_s3_obj(params) {
  await s3.putObject(params).promise();
  const publicUrl = await s3.getSignedUrlPromise("getObject", {
    Bucket: process.env.IMAGE_BUCKET_NAME,
    Key: params.Key,
    Expires: expiresTime,
  });
  return publicUrl;
}

async function make_pointcard_replyEventObj(url, user_id) {
  let template = require("./flex-pointcard-template.json");
  template.hero.url = url;
  template.body.contents[3].contents[1].text = user_id;
  const replyEventObj = {
    type: "flex",
    altText: "This is a Flex Message",
    contents: template,
  };
  return replyEventObj;
}

async function make_qrcode_s3url(s3id, url) {
  const qrCodeBuffer = await qr.toBuffer(url);
  const params = {
    Bucket: process.env.IMAGE_BUCKET_NAME,
    Key: `${s3id}_qr.png`,
    Body: qrCodeBuffer,
    ContentType: "image/png",
  };
  const qrcode_url = await put_s3_obj(params);
  return qrcode_url;
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
