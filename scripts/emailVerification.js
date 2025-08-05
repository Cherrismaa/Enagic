// emailVerification.js
import { API_BASE } from '/scripts/apiConfig.js';

export function initEmailVerification({
  emailFieldId,
  verifyButtonId,
  otpModalId,
  otpInputId,
  submitOtpId,
  cancelOtpId,
  successMsgId,
  onVerified
}) {
  
  const emailField = document.getElementById(emailFieldId);
  const verifyButton = document.getElementById(verifyButtonId);
  const otpModal = document.getElementById(otpModalId);
  const otpInput = document.getElementById(otpInputId);
  const submitOtpBtn = document.getElementById(submitOtpId);
  const cancelOtpBtn = document.getElementById(cancelOtpId);
  const successMsg = document.getElementById(successMsgId);

  let currentEmail = "";

  const showOtpModal = () => otpModal.classList.remove("hidden");
  const hideOtpModal = () => otpModal.classList.add("hidden");

  const markAsVerified = (email) => {
    localStorage.setItem("verifiedEmail", email.trim().toLowerCase());
    successMsg.classList.remove("hidden");
    successMsg.classList.add("flex");
    onVerified();
  };

  const isVerified = () =>
  localStorage.getItem("verifiedEmail") === emailField.value.trim().toLowerCase();

  verifyButton.addEventListener("click", async () => {
    const email = emailField.value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    currentEmail = email;
    console.log("🔁 Starting email verification for:", email);
    console.log("🔗 POST", `${API_BASE}/api/verify-email/request`);

    const res = await fetch(`${API_BASE}/api/verify-email/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
});

  let data;
  try {
    data = await res.json();
    console.log("📨 Server responded with:", data);
  } catch {
    alert("Server response was not valid JSON.");
    return;
  }

  if (res.ok && data.verified) {
    markAsVerified(email);
  } else if (res.ok && (data.requiresOtp || data.message?.includes("OTP sent"))) {
  showOtpModal();
} else {
  alert(data.error || "❌ Failed to send OTP.");
}

  });

  submitOtpBtn.addEventListener("click", async () => {
    const otp = otpInput.value.trim();
    if (!/^\d{6}$/.test(otp)) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }
    const email = emailField.value.trim().toLowerCase();

    try {
      const res = await fetch(`${API_BASE}/api/verify-email/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        console.log("✅ OTP verified. Marking as verified and hiding modal.");
        hideOtpModal();
        markAsVerified(currentEmail);
        otpInput.value = "";
      } else {
        alert("Invalid or expired OTP");
        hideOtpModal();
        otpInput.value = "";
      }
    }  
    
    catch (err) {
        hideOtpModal();
        otpInput.value = "";
        console.error("OTP verification failed:", err);
        alert("Verification request failed.");
      }

  });

  cancelOtpBtn.addEventListener("click", () => {
    hideOtpModal();
    otpInput.value = "";
  });

  emailField.addEventListener("input", () => {
    if (isVerified()) {
      successMsg.classList.remove("hidden");
      successMsg.classList.add("flex");
      onVerified();
    } else {
      successMsg.classList.add("hidden");
      successMsg.classList.remove("flex");
    }
  })

  if (isVerified()) {
    successMsg.classList.remove("hidden");
    successMsg.classList.add("flex");
    onVerified();
  }

  return isVerified;
}
