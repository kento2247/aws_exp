var aws = require("aws-sdk");
var dynamo = new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const posted_tablename = event.tablename;
  const posted_method = event.method;
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,GET",
    },
    body: "",
  };
  if (posted_method == "query") {
    const posted_query = event.query;
    let query_data = {
      tablename: posted_tablename, //テーブル名
      query: posted_query,
    };
    let res = await dynamo_query(query_data);
    response.body = JSON.stringify(res);
  } else if (posted_method == "put") {
    const posted_item = event.item;
    let parms = {
      TableName: posted_tablename, //テーブル名
      Item: posted_item,
    };
    let res = await dynamo.put(parms).promise();
    response.body = JSON.stringify(res);
  }
  return response;
};

async function dynamo_query(obj) {
  const tablename = obj.tablename;
  const query = obj.query;
  let query_string = "";
  let query_params = {
    TableName: tablename,
    KeyConditionExpression: query_string, //検索条件
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
  };
  query.forEach((element) => {
    const key = element.key;
    const value = element.value;
    if (query_string != "") {
      query_string += " and ";
    }
    query_string += `#${key} = :${key}`;
    query_params.ExpressionAttributeNames[`#${key}`] = key;
    query_params.ExpressionAttributeValues[`:${key}`] = value;
  });
  query_params.KeyConditionExpression = query_string;
  console.log(query_params);
  const result = await dynamo.query(query_params).promise();
  return result.Items;
}
