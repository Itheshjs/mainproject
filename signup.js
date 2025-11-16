document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const formError = document.getElementById('formError');
  if (emailError) emailError.textContent = '';
  if (passwordError) passwordError.textContent = '';
  if (formError) formError.textContent = '';
  
  // Client-side validation
  // Normalize email: trim and lowercase domain
  const rawEmail = String(form.email.value || '').trim();
  const emailParts = rawEmail.split('@');
  const normalizedEmail = emailParts.length === 2 ? `${emailParts[0]}@${emailParts[1].toLowerCase()}` : rawEmail;
  form.email.value = normalizedEmail;
  const email = normalizedEmail;
  const password = form.password.value;
  const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasMinLen = password.length >= 8;
  // Set custom validity messages for inline feedback
  form.email.setCustomValidity('');
  form.password.setCustomValidity('');
  if (!isValidEmail) {
    form.email.setCustomValidity('Please enter a valid email address');
    if (emailError) emailError.textContent = 'Please enter a valid email address';
  }
  if (!(hasLower && hasUpper && hasNumber && hasSpecial && hasMinLen)) {
    form.password.setCustomValidity('Min 8 chars; include uppercase, lowercase, number, and special character');
    if (passwordError) passwordError.textContent = 'Weak password — meet all requirements above.';
  }
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // Get selected technologies
  const technologySelect = form.preferredTechnologies;
  const selectedTechnologies = [];
  for (let i = 0; i < technologySelect.options.length; i++) {
    if (technologySelect.options[i].selected) {
      selectedTechnologies.push(technologySelect.options[i].value);
    }
  }
  
  const data = {
    username: form.username.value,
    fullName: form.fullName.value,
    usertype: form.usertype.value,
    phone: form.phone.value || '',
    email: form.email.value,
    password: form.password.value,
    location: form.location.value,
    careerGoal: form.careerGoal.value,
    preferredTechnologies: selectedTechnologies
  };
  
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  try {
    const res = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json().catch(() => ({ success: false, message: 'Invalid server response' }));
    // Only redirect on explicit success true
    if (res.ok && result && result.success === true) {
      window.location.href = 'login.html';
      return;
    }
    // Stay on page and show inline error(s)
    const msg = String((result && result.message) || 'Signup failed');
    if (/email already exists/i.test(msg)) {
      if (emailError) emailError.textContent = 'Email already exists — try logging in.';
    } else if (/email/i.test(msg)) {
      if (emailError) emailError.textContent = msg;
    } else if (/password/i.test(msg)) {
      if (passwordError) passwordError.textContent = msg;
    } else {
      if (formError) formError.textContent = msg;
    }
  } catch (err) {
    if (formError) formError.textContent = 'Network error — please try again.';
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}); 

// Real-time validation hints
(function () {
  const form = document.getElementById('signupForm');
  if (!form) return;
  const emailInput = form.email;
  const passwordInput = form.password;
  const emailHint = document.getElementById('emailHint');
  const hintLen = document.getElementById('hint-length');
  const hintLower = document.getElementById('hint-lower');
  const hintUpper = document.getElementById('hint-upper');
  const hintNum = document.getElementById('hint-number');
  const hintSpec = document.getElementById('hint-special');

  function setItemState(el, ok) {
    if (!el) return;
    el.style.color = ok ? 'green' : 'inherit';
    el.textContent = el.textContent.replace(/^✅\s*|^\u2713\s*|^\u274C\s*|^❌\s*/, '');
    el.textContent = (ok ? '✅ ' : '❌ ') + el.textContent;
  }

  function updateEmailHint() {
    const val = String(emailInput.value || '').trim();
    const ok = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);
    emailInput.setCustomValidity('');
    if (!ok && val.length > 0) {
      emailInput.setCustomValidity('Please enter a valid email address');
    }
    const emailError = document.getElementById('emailError');
    const formError = document.getElementById('formError');
    if (emailError) emailError.textContent = ok ? '' : emailError.textContent;
    if (formError) formError.textContent = '';
  }

  function updatePasswordHints() {
    const val = String(passwordInput.value || '');
    const okLen = val.length >= 8;
    const okLower = /[a-z]/.test(val);
    const okUpper = /[A-Z]/.test(val);
    const okNum = /\d/.test(val);
    const okSpec = /[^A-Za-z0-9]/.test(val);

    setItemState(hintLen, okLen);
    setItemState(hintLower, okLower);
    setItemState(hintUpper, okUpper);
    setItemState(hintNum, okNum);
    setItemState(hintSpec, okSpec);

    passwordInput.setCustomValidity('');
    if (!(okLen && okLower && okUpper && okNum && okSpec) && val.length > 0) {
      passwordInput.setCustomValidity('Min 8 chars; include uppercase, lowercase, number, and special character');
    }
    const passwordError = document.getElementById('passwordError');
    const formError = document.getElementById('formError');
    if (passwordError) passwordError.textContent = '';
    if (formError) formError.textContent = '';
  }

  emailInput && emailInput.addEventListener('input', updateEmailHint);
  passwordInput && passwordInput.addEventListener('input', updatePasswordHints);

  // Initialize on load
  updateEmailHint();
  updatePasswordHints();
})();