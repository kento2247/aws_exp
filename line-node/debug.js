const LINE_ID_AUTH_API_ENDPOINT =
  "https://mqa60zu459.execute-api.us-east-1.amazonaws.com/dynamoLogin";

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

const result = check_login("Uaedb10ed004057a7f73606b62ecfc6f7");
