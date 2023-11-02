const AWS = require("aws-sdk");
const lambda = new AWS.Lambda();

const params = {
  FunctionName: "test-py",
  InvocationType: "RequestResponse", // 同期呼び出し
  Payload: JSON.stringify({ key: "value" }), // 関数Bに渡すデータ (JSON形式)
};

lambda.invoke(params, function (err, data) {
  if (err) {
    console.error(err, err.stack);
  } else {
    const result = JSON.parse(data.Payload);
    console.log(result);
  }
});
