// signup.js
const service_signup_api =
  "https://x8euwieht0.execute-api.us-east-1.amazonaws.com/signup";

document
  .getElementById("signupForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      document.getElementById("flashMessage").innerText =
        "Passwords do not match. Please try again.";
      return;
    }

    const postData = {
      email: email,
      password: password,
    };

    fetch(service_signup_api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("signup api result: ", data);
        let response_body = JSON.parse(data.body);
        if (response_body.success) {
          document.getElementById("flashMessage").classList.remove("is-danger");
          document.getElementById("flashMessage").classList.add("is-success");
          document.getElementById("flashMessage").innerText =
            "Signup successful. Redirecting to login page...";
          document.getElementById("flashMessage").style.display = "block";

          setTimeout(function () {
            window.location.href = "login.html";
          }, 5000);
        } else {
          document
            .getElementById("flashMessage")
            .classList.remove("is-success");
          document.getElementById("flashMessage").classList.add("is-danger");
          document.getElementById("flashMessage").innerText =
            "Signup failed. Please try again.\n" + response_body.message;
          document.getElementById("flashMessage").style.display = "block";
        }
      })
      .catch((error) => console.error("Error:", error));
  });

document.getElementById("toggleSignin").addEventListener("click", function () {
  window.location.href = "login.html" + window.location.search;
});
