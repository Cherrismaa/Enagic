//customer-contact\customer-contact.js

import { initEmailVerification } from './emailVerification.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  let formJustSubmitted = false;
  let isEmailVerified = false;

  const markVerified = () => {
    isEmailVerified = true;
    document.getElementById('isEmailVerified').value = 'true';
    localStorage.setItem("verifiedEmail", document.getElementById("email").value.trim());
  };

  const getVerifiedStatus = initEmailVerification({
    emailFieldId: "email",
    verifyButtonId: "verifyEmailBtn",
    otpModalId: "otpModal",
    otpInputId: "otpInput",
    submitOtpId: "submitOtpBtn",
    cancelOtpId: "cancelOtpBtn",
    successMsgId: "emailVerifiedMsg",
    onVerified: markVerified,
  });

  const fields = {
    name: {
      validate: (v) => /^[A-Za-z]+(\s[A-Za-z]+)+$/.test(v.trim()),
      errorId: "nameError"
    },
    email: {
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      errorId: "emailError"
    },
    phone: {
      validate: (v) => /^\d{10}$/.test(v.trim()),
      errorId: "phoneError"
    },
    subject: {
      validate: (v) => v.trim() !== "",
      errorId: "subjectError"
    },
    area: {
      validate: (v) => {
        const trimmed = v.trim();
        return trimmed !== "" && trimmed.toLowerCase() !== "n/a" && trimmed !== "-";
      },
      errorId: "areaError"
    },
    message: {
      validate: (v) => v.trim() !== "",
      errorId: "messageError"
    }
  };

  const showError = (id, show, customMsg = "") => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.toggle("hidden", !show);
      el.classList.toggle("block", show);
      if (customMsg) el.textContent = customMsg;
    }
  };

  const validateField = (fieldId) => {
    const input = document.getElementById(fieldId);
    const { validate, errorId } = fields[fieldId];
    const isValid = validate(input.value.trim());

    if (fieldId === 'area' && !isValid && input.value.trim() === "") {
      showError(errorId, true, 'Type "N/A" if you prefer not to give your address.');
    } else {
      showError(errorId, !isValid);
    }

    return isValid;
  };

  Object.keys(fields).forEach((fieldId) => {
    const input = document.getElementById(fieldId);

    if (fieldId === "name") {
      input?.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
        validateField(fieldId);
      });
    } else if (fieldId === "phone") {
      input?.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
        validateField(fieldId);
      });
    } else {
      input?.addEventListener("input", () => validateField(fieldId));
    }

    input?.addEventListener("blur", () => validateField(fieldId));
  });

  const showLoading = () => document.getElementById("loadingOverlay").classList.remove("hidden");
  const hideLoading = () => document.getElementById("loadingOverlay").classList.add("hidden");
  const showSuccessModal = () => document.getElementById("successModal").classList.remove("hidden");
  const hideSuccessModal = () => document.getElementById("successModal").classList.add("hidden");

  const resetForm = () => {
    form.reset();
    Object.values(fields).forEach(f => showError(f.errorId, false));
    localStorage.removeItem("verifiedEmail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  document.getElementById("successOkButton").addEventListener("click", () => {
    hideSuccessModal();
    resetForm();
    formJustSubmitted = true;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentEmail = document.getElementById("email").value.trim();
    const emailVerifiedStored = localStorage.getItem("verifiedEmail");

    if (currentEmail !== emailVerifiedStored) {
      return;
    }

    if (formJustSubmitted) {
      formJustSubmitted = false;
      return;
    }

    let allValid = true;
    const formData = {};

    formData.isVerified = isEmailVerified;

    Object.keys(fields).forEach((fieldId) => {
      const valid = validateField(fieldId);
      if (!valid) allValid = false;

      if (fieldId === "subject") {
        const select = document.getElementById("subject");
        formData[fieldId] = select.options[select.selectedIndex].text;
      } else {
        formData[fieldId] = document.getElementById(fieldId).value.trim();
      }
    });

    if (!allValid) {
      alert("⚠️ Please correct the highlighted errors.");
      return;
    }

    showLoading();

        try {
      const res = await fetch("http://localhost:5000/api/customer-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const resultText = await res.text();
      let result;

      try {
        result = JSON.parse(resultText);
      } catch {
        console.error("Server response was not JSON:", resultText);
        alert("❌ Server error. Try again later.");
        return;
      }

      if (result.success || result.message?.includes("submitted")) {
        showSuccessModal();
      } else {
        alert("❌ Submission failed: " + (result.message || "Unknown error."));
      }
    } catch (err) {
      alert("❌ Network or server error.");
      console.error(err);
    } finally {
      hideLoading();
    }
  });
});
