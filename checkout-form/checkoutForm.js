//checkout-form\checkoutForm.js

import { API_BASE } from '/scripts/apiConfig.js';

import { initEmailVerification } from '../scripts/emailVerification.js';

// Restrict input types
const fullNameInput = document.querySelector('input[name="fullName"]');
fullNameInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
});

const mobileInput = document.querySelector('input[name="mobile"]');
mobileInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
});

const pincodeInput = document.querySelector('input[name="pincode"]');
pincodeInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
});

// Validation
function showError(inputName, message, condition) {
  const error = document.getElementById(inputName + 'Error');
  if (!condition) {
    error.textContent = message;
    error.classList.add('visible');
    return false;
  } else {
    error.classList.remove('visible');
    return true;
  }
}

fullNameInput.addEventListener('blur', () => {
  const value = fullNameInput.value.trim();
  const isValid = /^[a-zA-Z]+\s+[a-zA-Z]+$/.test(value);
  showError('name', 'Please enter your first and last name.', isValid);
});

mobileInput.addEventListener('blur', () => {
  const isValid = /^[6-9]\d{9}$/.test(mobileInput.value);
  showError('mobile', 'Mobile number must be 10 digits.', isValid);
});

const emailInput = document.getElementById('emailInput');
emailInput.addEventListener('blur', () => {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
  showError('email', "Email must contain '@'", isValid);
});

pincodeInput.addEventListener('blur', () => {
  const isValid = /^[1-9]\d{6}$/.test(pincodeInput.value);
  showError('pincode', 'Please enter your 6-digit Pin Code', isValid);
});

// State dropdown
const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry"
];

const stateSearch = document.getElementById('stateSearch');
const stateDropdown = document.getElementById('stateDropdown');
const stateHidden = document.getElementById('stateHidden');

stateSearch.addEventListener('input', () => {
  const query = stateSearch.value.toLowerCase();
  stateDropdown.innerHTML = '';
  const filtered = states.filter(state => state.toLowerCase().startsWith(query)).sort();
  filtered.forEach(state => {
    const li = document.createElement('li');
    li.textContent = state;
    li.className = 'cursor-pointer px-4 py-2 hover:bg-green-100';
    li.addEventListener('click', () => {
      stateSearch.value = state;
      stateHidden.value = state;
      stateDropdown.classList.add('hidden');
    });
    stateDropdown.appendChild(li);
  });
  stateDropdown.classList.toggle('hidden', filtered.length === 0);
});

document.addEventListener('click', (e) => {
  if (!stateSearch.contains(e.target) && !stateDropdown.contains(e.target)) {
    stateDropdown.classList.add('hidden');
  }
});

// ✅ Email verification setup using shared module
let isEmailVerified = false;

const isVerifiedFn = initEmailVerification({
  emailFieldId: "emailInput",
  verifyButtonId: "verifyEmailButton",
  otpModalId: "otpSection",
  otpInputId: "otpInput",
  submitOtpId: "verifyOtpButton",
  cancelOtpId: "cancelOtpButton",
  successMsgId: "emailSuccessMessage",
  onVerified: () => {
    isEmailVerified = true;
    document.getElementById("emailVerifyError").classList.remove("visible");
  }
});

// Form submission
const form = document.getElementById('checkoutForm');
const loadingOverlay = document.getElementById('loadingOverlay');
const successModal = document.getElementById('successModal');
const successOkButton = document.getElementById('successOkButton');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    fullName: fullNameInput.value.trim(),
    mobile: mobileInput.value.trim(),
    email: emailInput.value.trim().toLowerCase(),
    streetNumber: form.streetNumber.value.trim(),
    houseNumber: form.houseNumber.value.trim(),
    locality: form.locality.value.trim(),
    city: form.city.value.trim(),
    pincode: pincodeInput.value.trim(),
    state: stateHidden.value.trim(),
    landmark: form.landmark.value.trim()
  };

    const allEmpty =
    !data.fullName &&
    !data.mobile &&
    !data.email &&
    !data.streetNumber &&
    !data.houseNumber &&
    !data.locality &&
    !data.city &&
    !data.pincode &&
    !data.state;

  if (allEmpty) {
    alert('❌ Please fill in all the required fields to submit the form.');
    return;
  }

  const validations = [
    showError('name', 'Please enter your first and last name.', /^[a-zA-Z]+\s+[a-zA-Z]+$/.test(data.fullName)),
    showError('mobile', 'Please enter your valid 10 digit mobile number.', /^[6-9]\d{10}$/.test(data.mobile)),
    showError('email', "Email must contain '@' and '.'", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)),
    showError('street', 'Street Number is required', !!data.streetNumber),
    showError('house', 'House Number is required', !!data.houseNumber),
    showError('locality', 'Area is required', !!data.locality),
    showError('city', 'City / Town is required', !!data.city),
    showError('pincode', 'Please enter your 6-digit Pin Code', /^\d{6}$/.test(data.pincode)),
    showError('state', 'State is required', !!data.state)
  ];

  if (validations.includes(false)) return;
  if (!isEmailVerified) {
    document.getElementById('emailVerifyError').classList.add('visible');
    alert('❌ Please verify your email before submitting.');
    return;
  }

  loadingOverlay.classList.remove('hidden');

  try {
      const res = await fetch(`${API_BASE}/api/checkoutForm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

    const text = await res.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      alert('❌ Server did not return valid JSON');
      console.error('Response was:', text);
    }

    loadingOverlay.classList.add('hidden');

    if (result.success || result.message?.includes('submitted')) {
      successModal.classList.remove('hidden');
      form.reset();
      stateHidden.value = '';
      isEmailVerified = false;
    } else {
      alert('❌ Submission failed: ' + (result.message || 'Unknown error.'));
    }
  } catch (err) {
    loadingOverlay.classList.add('hidden');
    alert('❌ Network/server error.');
    console.error(err);
  }
});

successOkButton.addEventListener('click', () => {
  successModal.classList.add('hidden');
});
