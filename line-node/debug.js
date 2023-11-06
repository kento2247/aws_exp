const LINE_ID_AUTH_API_ENDPOINT =
  "https://mqa60zu459.execute-api.us-east-1.amazonaws.com/dynamoLogin";

const qr = require("qrcode");

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

async function make_qrcode() {
  const url =
    "https://ux3v87sf1e.execute-api.us-east-1.amazonaws.com/get_point_info?service_id=e5e368a9-33af-45ec-9029-82307cf8c650";
  try {
    const buffer = await qr.toBuffer(url);
    console.log(buffer);
  } catch (e) {
    console.error("Error:", e);
  }
}

async function get_point_info(service_id) {
  const POINTCARD_INFO_ENDPOINT =
    "https://ux3v87sf1e.execute-api.us-east-1.amazonaws.com/get_point_info";
  const response = await fetch(POINTCARD_INFO_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "get",
      user_id: service_id,
    }),
  });
  const data = await response.json();
  console.log(data);
}
// const result = check_login("Uaedb10ed004057a7f73606b62ecfc6f7");
// const result = make_qrcode();
const result = get_point_info("1");
