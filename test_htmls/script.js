document
  .getElementById("myForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // フォームのデフォルトの動作を停止

    const userId = document.getElementById("userId").value.toString(); // ユーザーが入力したユーザーIDを取得し、文字列に変換

    const apiUrl =
      "https://ux3v87sf1e.execute-api.us-east-1.amazonaws.com/get_point_info";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "get",
          user_id: userId,
        }),
      });

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  });
