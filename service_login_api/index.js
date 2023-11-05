const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("event: ", event);
  const email = event.email;
  const password = event.password;

  // DynamoDBからログイン情報を取得
  const params = {
    TableName: "login_infos", // テーブル名を適切に設定
    Key: {
      email: email,
    },
  };

  try {
    const data = await dynamo.get(params).promise();
    const storedPassword = data.Item ? data.Item.password : null;
    const userId = data.Item ? data.Item.user_id : null;

    if (storedPassword === password) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, user_id: userId }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Internal Server Error",
      }),
    };
  }
};
