"use strict";
const line = require("@line/bot-sdk");
const client = new line.Client({ channelAccessToken: process.env.ACCESSTOKEN });

exports.handler = function (event, context) {
  const data = event.events[0];
  console.log(data);

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

  console.log(
    "display data\n\n",
    type,
    message_type,
    message_id,
    message_text,
    replyToken,
    source_type,
    source_userId,
    timestamp,
    mode
  );

  const reply_message = {
    type: "text",
    text: message_text,
  };
  client
    .replyMessage(replyToken, reply_message)
    .then((response) => {
      let lambdaResponse = {
        statusCode: 200,
        headers: { "X-Line-Status": "OK" },
        body: '{"result":"completed"}',
      };
      context.succeed(lambdaResponse);
    })
    .catch((err) => console.log(err));
};
