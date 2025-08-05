//customer-contact\customer-contact.js

import { API_BASE } from '/scripts/apiConfig.js';

import { initEmailVerification } from '../scripts/emailVerification.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  let formJustSubmitted = false;
  let isEmailVerified = false;

  const markVerified = () => {
    isEmailVerified = true;
    document.getElementById('isEmailVerified').value = 'true';
    const emailValue = document.getElementById("email").value.trim().toLowerCase();
    localStorage.setItem("verifiedEmail", emailValue);
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
      validate: (v) => /^[6-9]\d{9}$/.test(v.trim()),
      errorId: "phoneError"
    },
    subject: {
      validate: (v) => v.trim() !== "",
      errorId: "subjectError"
    },
    machineType: {
      validate: (v) => v.trim() !== "",
      errorId: "machineTypeError"
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
    } else if (fieldId === 'phone') {
      const val = input.value.trim();
      if (val.length === 10 && !/^[6-9]/.test(val)) {
        showError(errorId, true, "Please enter a valid phone number.");
      } else if (!/^\d{10}$/.test(val)) {
        showError(errorId, true, "Enter a 10-digit phone number.");
      } else {
        showError(errorId, false);
      }
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
    document.getElementById("subject").selectedIndex = 0;
    document.getElementById("machineType").selectedIndex = 0;
  };

  document.getElementById("successOkButton").addEventListener("click", () => {
    hideSuccessModal();
    resetForm();
    formJustSubmitted = true;
  });

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const phoneInput = document.getElementById('phone');
  const currentEmail = document.getElementById("email").value.trim().toLowerCase();
  const emailVerifiedStored = localStorage.getItem("verifiedEmail");
  const hiddenVerifiedValue = document.getElementById("isEmailVerified").value;

  if (formJustSubmitted) {
    formJustSubmitted = false;
    return;
  }

  // Run validation first
  let allValid = true;
  const formData = {};

  Object.keys(fields).forEach((fieldId) => {
    const valid = validateField(fieldId);
    if (!valid) allValid = false;

    if (fieldId === "subject") {
      const select = document.getElementById("subject");
      formData[fieldId] = select.options[select.selectedIndex].text;

    } else if (fieldId === "machineType") {
      const select = document.getElementById("machineType");
      formData[fieldId] = select.options[select.selectedIndex].text;
    } else if (fieldId === "email") {
      formData[fieldId] = currentEmail;
    } else if (fieldId === "phone") {
      const phoneVal = document.getElementById(fieldId).value.trim();
      formData.phone = document.getElementById(fieldId).value.trim();
    } else {
      formData[fieldId] = document.getElementById(fieldId).value.trim();
    }
  });

  formData.isVerified = hiddenVerifiedValue === 'true';

  if (!allValid) {
    alert("⚠️ Please fill in all required fields before submitting.");
    return;
  }

  // Final double-check before submit
  const verifiedMatch = currentEmail === emailVerifiedStored;
  const isVerified = hiddenVerifiedValue === 'true';

  if (!currentEmail || !verifiedMatch || !isVerified) {
    alert("⚠️ Please verify your email before submitting the form.");
    return;
  }

  showLoading();

  try {
    const res = await fetch(`${API_BASE}/api/customer-contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    let result;
    try {
      result = await res.json();
    } catch (jsonErr) {
      console.error("❌ Failed to parse JSON. Raw response:");
      const rawText = await res.text();
      console.error(rawText);
      alert("❌ Server returned invalid response. Check console for details.");
      return;
    }

    console.log("📨 Server responded:", result);

    if (res.ok && (result.success || result.message?.toLowerCase().includes("submitted"))) {
      showSuccessModal();
    } else {
      alert("❌ Submission failed: " + (result.message || `Unknown error. Status: ${res.status}`));
    }
  } catch (err) {
    alert("❌ Network or server error.");
    console.error(err);
  } finally {
    hideLoading();
  }
});

});