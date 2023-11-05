const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "login_infos"; // DynamoDBのテーブル名

exports.handler = async (event) => {
  const email = event.email;
  const password = event.password;
  const uuid = uuidv4();
  const created_at = new Date().toISOString();

  // 重複するemailが存在するか確認
  const params = {
    TableName: TABLE_NAME,
    Key: {
      email: email,
    },
  };
  console.log("params: ", params);

  try {
    const data = await dynamodb.get(params).promise();
    console.log("data: ", data);
    if (data.Item) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Email already exists",
        }),
      };
    } else {
      // DynamoDBにデータをput
      const putParams = {
        TableName: TABLE_NAME,
        Item: {
          email: email,
          password: password,
          user_id: uuid,
          created_at: created_at,
        },
      };
      await dynamodb.put(putParams).promise();

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, user_id: uuid }),
      };
    }
  } catch (error) {
    console.log("error: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Internal Server Error",
      }),
    };
  }
};
