// Reset password form handler
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

  setupToggle("togglePassword1", "password");
  setupToggle("togglePassword2", "confirmPassword");

  // Elements refs
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");
  const rulesBox = document.getElementById("passwordRules");
  const matchHint = document.getElementById("matchHint");
  const formErrors = document.getElementById("formErrors");
  const formSuccess = document.getElementById("formSuccess");

  // Validation rules
  const rules = {
    lengthRule: (pw) => pw.length >= 8,
    uppercaseRule: (pw) => /[A-Z]/.test(pw),
    lowercaseRule: (pw) => /[a-z]/.test(pw),
    numberRule: (pw) => /[0-9]/.test(pw),
  };

  const validateRules = (password) => {
    let allValid = true;
    for (const [id, check] of Object.entries(rules)) {
      const el = document.getElementById(id);
      if (!el) continue;
      const passed = check(password);
      el.classList.toggle("valid", passed);
      el.classList.toggle("invalid", !passed);
      if (!passed) allValid = false;
    }
    return allValid;
  };

  const checkMatch = () => {
    const mismatch =
      confirmInput.value && confirmInput.value !== paswordInput.value;
    matchHint.style.display = mismatch ? "block" : "none";
    return !mismatch;
  };

  passwordInput.addEventListener(
    "focus",
    () => (rulesBox.style.display = "block"),
  );

  passwordInput.addEventListener("input", () => {
    validateRules(passwordInput.value);
    if (confirmInput.value) checkMatch();
  });

  confirmInput.addEventListener("input", checkMatch);

  // Submit
  document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const allRulesPass = validateRules(passwordInput.value);
    const passwordMatch = checkMatch();

    if (!allRulesPass || !passwordMatch) {
      rulesBox.style.display = "block";
      return;
    }

    const submitBtn = document.getElementById("submitButton");
    submitBtn.disabled = true;
    submitBtn.textContent = "Resetting...";

    formErrors.style.display = "none";
    formErrors.innerHTML = "";
    formSuccess.style.display = "none";

    try {
      const res = await fetch(
        "http://localhost/LekkerList/backend/api/resetpassword.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: document.getElementById("email").value.trim(),
            password: passwordInput.value,
            confirmPassword: confirmInput.value,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        formSuccess.innerHTML = "Password updated! Redirecting you to login...";
        formSuccess.style.display = "block";
        setTimeout(() => {
          window.location.href =
            "http://localhost/LekkerList/backend/pages/login.html";
        }, 2000);
      } else {
        formErrors.innerHTML = (data.errors || [data.error])
          .map((err) => `<p>${err}</p>`)
          .join("");
        formErrors.style.display = "block";
      }
    } catch {
      formErrors.innerHTML = "<p>Server error. Please try again</p>";
      formErrors.style.display = "block";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Reset Password";
    }
  });
});
