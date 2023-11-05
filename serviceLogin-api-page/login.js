document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const postData = {
      email: email,
      password: password,
    };

    fetch("https://example.com/login-endpoint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "https://example.com/success-page";
        } else {
          document.getElementById("flashMessage").innerText =
            "Login failed. Please try again.";
        }
      })
      .catch((error) => console.error("Error:", error));
  });
