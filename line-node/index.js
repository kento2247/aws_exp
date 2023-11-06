"use strict";
const line = require("@line/bot-sdk");
const AWS = require("aws-sdk");
const qr = require("qrcode");

const client = new line.Client({ channelAccessToken: process.env.ACCESSTOKEN });
const s3 = new AWS.S3();
const expiresTime = 3600;
const POINTCARD_TEMPLATE_PATH = "./flex-pointcard-template.json";
const LIFF_AUTH_URL = "https://liff.line.me/2001459172-KopGbo3y";
const LINE_ID_AUTH_API_ENDPOINT =
  "https://mqa60zu459.execute-api.us-east-1.amazonaws.com/dynamoLogin";

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

  let replyEventObj = {};

  if (type == "postback") {
    const postback_data = data.postback.data;
    const postback_params = data.postback.params;
    const source = data.source;
    const source_type = source.type;
    const source_userId = source.userId;
    console.log(postback_data, postback_params);
    switch (postback_data) {
      case "update_pointcard":
        replyEventObj = await get_pointcard_info_obj(source_userId);
        break;
      default:
        replyEventObj = {
          type: "text",
          text: `params: ${postback_params}\ndata: ${postback_data}`,
        };
        break;
    }
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

    replyEventObj = {
      //default reply
      type: "text",
      id: message_id,
      text: `tmp`,
    };

    switch (message_type) {
      case "image":
        const image_url = await getS3ObjectUrl_fromLine(
          message_id,
          message_type
        );
        replyEventObj.text = `Received image file: ${image_url}`;
        break;
      case "audio":
        const s3ObjectUrl = await getS3ObjectUrl_fromLine(
          message_id,
          message_type
        );
        replyEventObj.text = `Received audio file: ${s3ObjectUrl}`;
        break;
      case "text":
        const is_logined = await check_login(source_userId);
        if (!is_logined) {
          replyEventObj.text = `You are not logined.\nPlease continue to complete the linkage between your service account and your LINE account at the URL below.\n\n${LIFF_AUTH_URL}`;
        } else {
          if (message_text === "pointcard") {
            replyEventObj = await get_pointcard_info_obj(source_userId);
          } else {
            replyEventObj.text = `\"${message_text}\" is not supported.`;
          }
        }
        break;
      default:
        replyEventObj.text = `This message type is unsupported: ${message_type}`;
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

async function make_pointcard_replyEventObj(pointcard_info) {
  let template = require(POINTCARD_TEMPLATE_PATH);
  template.hero.url = pointcard_info.image.url;
  template.hero.size = pointcard_info.image.size;
  template.hero.aspectRatio = pointcard_info.image.aspectRatio;

  template.body.contents[0].text = pointcard_info.store_name;
  template.body.contents[1].contents[1].text = pointcard_info.point;
  const bounus_text = {
    type: "text",
    text: "Bonus: ",
  };
  const gold_star_icon = {
    type: "icon",
    size: "sm",
    url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
  };
  const gray_star_icon = {
    type: "icon",
    size: "sm",
    url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png",
  };
  const scale_text = {
    type: "text",
    text: `${pointcard_info.bounus}/${pointcard_info.bounus_max}`,
    size: "sm",
    color: "#999999",
    margin: "md",
    flex: 0,
  };
  const bounus_contents = [bounus_text];
  for (let i = 0; i < pointcard_info.bounus_max; i++) {
    if (i < pointcard_info.bounus) {
      bounus_contents.push(gold_star_icon);
    } else {
      bounus_contents.push(gray_star_icon);
    }
  }
  bounus_contents.push(scale_text);
  template.body.contents[2].contents = bounus_contents;
  template.body.contents[3].contents[1].text = pointcard_info.user_id;
  let history_contents = [
    template.body.contents[4].contents[0],
    template.body.contents[4].contents[1],
  ];
  for (let i = 0; i < pointcard_info.history.length; i++) {
    const history = pointcard_info.history[i];
    const history_content = {
      type: "box",
      layout: "baseline",
      contents: [
        {
          type: "text",
          text: history.date,
          margin: "none",
          size: "sm",
          align: "end",
        },
        {
          type: "text",
          text: history.point > 0 ? `+${history.point}` : history.point,
          margin: "none",
          size: "sm",
          align: "end",
        },
      ],
    };
    history_contents.push(history_content);
  }
  template.body.contents[4].contents = history_contents;
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

async function get_pointcard_info_obj(line_user_id) {
  let pointcard_info = {
    image: {
      url: "https://contents.blog.jicoman.info/image/aws.png",
      aspectRatio: "1:1",
      size: "4xl",
    },
    store_name: "Yagami bakery",
    point: "0",
    bounus: 0,
    bounus_max: 5,
    user_id: "123456789",
    history: [
      { date: "2020/10/01", point: "1000" },
      { date: "2020/10/02", point: "-100" },
      { date: "2020/10/03", point: "200" },
    ],
  };
  //{} => not resistered
  //{"pointcard_info":{}} => resistered
  //fetch to lambda and get pointcard_info
  const qrcode_url = "https://sample.com";
  const qrcode_img_url = await make_qrcode_s3url(line_user_id, qrcode_url);
  pointcard_info.image.url = qrcode_img_url;
  pointcard_info.user_id = line_user_id;
  const replyEventObj = await make_pointcard_replyEventObj(pointcard_info);
  return replyEventObj;
}

async function check_login(line_user_id) {
  //check login
  //if login => return true
  //else => return false
  const data = {
    tablename: "lineId_to_serviceInfo",
    method: "query",
    query: [
      {
        key: "line_id",
        value: line_user_id,
      },
    ],
  };

  try {
    const response = await fetch(LINE_ID_AUTH_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    const result_body = JSON.parse(result.body);
    if (result_body.length == 0) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}
