async function main() {
  const postData = {
    tablename: "lineId_to_serviceInfo",
    method: "query",
    query: [
      {
        key: "line_id",
        value: "test2",
      },
    ],
  };
  // POST request
  const result = await fetch(
    "https://mqa60zu459.execute-api.us-east-1.amazonaws.com/sample",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    }
  );
  const resultJson = await result.json();
  console.log(resultJson);
}

main();
