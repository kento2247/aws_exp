import fs from "fs";

export const handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));

  return {
    statusCode: 200,
    isBase64Encoded: false,
    headers: {
      "Content-Type": "text/html",
    },
    body: fs.readFileSync("index.html", "utf8"),
  };
};
