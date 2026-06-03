// Login handler
console.log("Login.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  // Password toggle
  const setupToggle = (btnId, inputId) => {
    const toggleBtn = document.getElementById(btnId);
    const passwordField = document.getElementById(inputId);

    if (!toggleBtn || !passwordField) return;

    toggleBtn.addEventListener("click", () => {
      const isText = passwordField.type === "text";
      passwordField.type = isText ? "password" : "text";
      toggleBtn.innerHTML = isText
        ? `<svg width="16" height="16"><Image href="../assets/images/eye.svg" width="16" height="16"/></svg>`
        : `<svg width="16" height="16"><Image href="../assets/images/eye-crossed.svg" width="16" height="16"/></svg>`;
    });
  };

  setupToggle("togglePassword", "passwordField");

  const form = document.getElementById("authForm");
  if (!form) return;

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("emailField").value.trim();
    const password = document.getElementById("passwordField").value;
    const errorBox =
      document.getElementById("errorBox") || createErrorBox(form);

    try {
      const res = await fetch(
        "http://localhost/LekkerList/backend/api/login.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      const data = await res.json();

      if (data.success) {
        const session = { token: data.token, user: data.user };
        const encoded = btoa(JSON.stringify(session));
        const targetPath = data.user.role === "admin" ? "/admin" : "/";
        window.location.href = `http://localhost:5173${targetPath}?auth=${encoded}`;
      } else {
        errorBox.textContent = data.error || "Login Failed";
      }
    } catch (err) {
      console.error("Login error: ", err);
      errorBox.textContent = "Server connection failed";
    }
  });
});

// Creates error box is missing form HTML
const createErrorBox = (form) => {
  const box = document.createElement("div");
  box.id = "errorBox";
  box.className = "alert alert-danger";
  form.prepend(box);
  return box;
};
