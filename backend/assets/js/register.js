// Register form handler
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
        ? `<svg width="16" height="16"><image href="../assets/images/eye.svg" width="16" height="16"/></svg>`
        : `<svg width="16" height="16"><image href="../assets/images/eye-crossed.svg" width="16" height="16"/></svg>`;
    });
  };

  setupToggle("togglePassword1", "password");
  setupToggle("togglePassword2", "confirmPassword");
  setupToggle("togglePassword3", "adminCode");

  //Password strength rules
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");
  const rulesBox = document.getElementById("passwordRules");
  const matchHint = document.getElementById("matchHint");

  const rules = {
    lower: {
      el: document.getElementById("lowercaseRule"),
      test: (pw) => /[a-z]/.test(pw),
    },
    upper: {
      el: document.getElementById("uppercaseRule"),
      test: (pw) => /[A-Z]/.test(pw),
    },
    number: {
      el: document.getElementById("numberRule"),
      test: (pw) => /[0-9]/.test(pw),
    },
    length: {
      el: document.getElementById("lengthRule"),
      test: (pw) => pw.length >= 8,
    },
  };

  const checkMatch = () => {
    const pw = passwordInput.value.trim();
    const confirm = confirmInput.value.trim();
    const mismatch = confirm.length > 0 && confirm !== pw;
    matchHint.style.display = mismatch ? "block" : "none";
  };

  passwordInput.addEventListener(
    "focus",
    () => (rulesBox.style.display = "block"),
  );

  passwordInput.addEventListener("blur", () => {
    if (!passwordInput.value) rulesBox.style.display = "none";
  });

  const onPasswordChange = () => {
    const val = passwordInput.value;
    Object.values(rules).forEach((r) => {
      if (!r.el) return;
      r.el.classList.toggle("valid", r.test(val));
      r.el.classList.toggle("invalid", !r.test(val));
    });

    checkMatch();
  };
  passwordInput.addEventListener("input", onPasswordChange);
  passwordInput.addEventListener("paste", () =>
    setTimeout(onPasswordChange, 0),
  );

  confirmInput.addEventListener("input", checkMatch);
  confirmInput.addEventListener("paste", () => setTimeout(checkMatch, 0));

  // Submit
  document
    .getElementById("registerForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const errorBox = document.getElementById("formErrors");
      const submitBtn = document.getElementById("submitButton");

      errorBox.style.display = "none";
      errorBox.innerHTML = "";
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating account...";

      const formData = new FormData();
      formData.append("firstname", document.getElementById("firstname").value);
      formData.append("lastname", document.getElementById("lastname").value);
      formData.append("email", document.getElementById("email").value);
      formData.append("password", document.getElementById("password").value);
      formData.append(
        "confirmPassword",
        document.getElementById("confirmPassword").value,
      );
      formData.append("adminCode", document.getElementById("adminCode").value);
      formData.append(
        "accountType",
        document.querySelector('input[name="accountType"]:checked').value,
      );

      try {
        const res = await fetch(
          "http://localhost/LekkerList/backend/api/register.php",
          {
            method: "POST",
            body: formData,
          },
        );

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json"))
          throw new Error("Unexpected server response");

        const data = await res.json();

        if (data.success) {
          document.getElementById("messageContent").textContent =
            "Registration successful! Redirecting you to login...";
          new bootstrap.Toast(document.getElementById("successToast")).show();
          setTimeout(() => {
            window.location.href =
              "http://localhost/LekkerList/backend/pages/login.html";
          }, 2000);
        } else {
          const errors = Array.isArray(data.errors)
            ? data.errors
            : [data.error || "Registration failed"];
          errorBox.innerHTML = errors.map((err) => `<p>${err}</p>`).join("");
          errorBox.style.display = "block";
        }
      } catch (err) {
        errorBox.innerHTML = `<p>${err.message}</p>`;
        errorBox.style.display = "block";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Account";
      }
    });
});
