// emailVerification.js

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
    localStorage.setItem("verifiedEmail", email);
    successMsg.classList.remove("hidden");
    successMsg.classList.add("flex");
    onVerified();
  };

  const isVerified = () => localStorage.getItem("verifiedEmail") === emailField.value.trim();

  verifyButton.addEventListener("click", async () => {
    const email = emailField.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    currentEmail = email;

    const res = await fetch("http://localhost:5000/api/verify-email/request", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email })
});

const data = await res.json();

if (res.ok && data.verified) {
  
  markAsVerified(email); 
} else if (res.ok && !data.verified) {
  
  showOtpModal();
} else {
  alert(data.error || "Failed to send OTP.");
}

  });

  submitOtpBtn.addEventListener("click", async () => {
    const otp = otpInput.value.trim();
    if (!/^\d{6}$/.test(otp)) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/verify-email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentEmail, otp })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        hideOtpModal();
        markAsVerified(currentEmail);
        otpInput.value = "";
      } else {
        alert("Invalid or expired OTP");
      }
    } catch {
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
