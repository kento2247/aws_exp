const service_login_api =
  "https://5sbpzbfrgl.execute-api.us-east-1.amazonaws.com/api";
let redirect_url =
  new URLSearchParams(window.location.search).get("redirect_url") ||
  "https://liff.line.me/2001459172-KopGbo3y";

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    // ボタンを無効化
    document.getElementById("loginButton").disabled = true;

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const postData = {
      email: email,
      password: password,
    };

    fetch(service_login_api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("login api result: ", data);
        let response_body = JSON.parse(data.body);
        if (response_body.success) {
          window.location.href =
            redirect_url + "?service_id=" + response_body.user_id;
        } else {
          document.getElementById("flashMessage").innerText =
            "Login failed. Please try again.";
        }
      })
      .catch((error) => console.error("Error:", error))
      .finally(() => {
        // ボタンを有効化
        document.getElementById("loginButton").disabled = false;
      });
  });

document.getElementById("toggleSignup").addEventListener("click", function () {
  window.location.href = "signup.html" + window.location.search;
});
