"use strict";
const line = require("@line/bot-sdk");
const client = new line.Client({ channelAccessToken: process.env.ACCESSTOKEN });
// ①SDKをインポート

exports.handler = function (event, context) {
  console.log(event);

  if (event.events[0].replyToken === "00000000000000000000000000000000") {
    let lambdaResponse = {
      statusCode: 200,
      headers: { "X-Line-Status": "OK" },
      body: '{"result":"connect check"}',
    };
    context.succeed(lambdaResponse);
    // ③接続確認エラーを確認する。
  } else {
    let text = event.events[0].message.text;
    const message = {
      type: "text",
      text,
    };
    client
      .replyMessage(event.events[0].replyToken, message)
      .then((response) => {
        let lambdaResponse = {
          statusCode: 200,
          headers: { "X-Line-Status": "OK" },
          body: '{"result":"completed"}',
        };
        context.succeed(lambdaResponse);
      })
      .catch((err) => console.log(err));
    // ④リクエストとして受け取ったテキストをそのまま返す
  }
};
