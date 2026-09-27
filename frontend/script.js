document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile menu toggle ---------- */
  const topbarToggle = document.getElementById('topbarToggle');
  const topbarMenu = document.getElementById('topbarMenu');

  if (topbarToggle) {
    topbarToggle.addEventListener('click', () => {
      const isOpen = topbarMenu.classList.toggle('open');
      topbarToggle.classList.toggle('open', isOpen);
      topbarToggle.setAttribute('aria-expanded', String(isOpen));
    });

    topbarMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        topbarMenu.classList.remove('open');
        topbarToggle.classList.remove('open');
        topbarToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Active nav link on scroll (desktop rail) ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const railLinks = document.querySelectorAll('.rail-nav a');

  if (sections.length && railLinks.length) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          railLinks.forEach(link => {
            link.classList.toggle('current', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

    sections.forEach(section => spyObserver.observe(section));
  }

  /* ---------- Scroll reveal (work rows only — one restrained pass) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Contact form ---------- */
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const statusBox = document.getElementById('formStatus');

  function setFieldError(name, hasError) {
    const field = form.querySelector(`[data-field="${name}"]`);
    if (field) field.classList.toggle('has-error', hasError);
  }

  function validate() {
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    setFieldError('name', !name);
    setFieldError('email', !emailOk);
    setFieldError('message', !message);

    return Boolean(name) && emailOk && Boolean(message);
  }

  function showStatus(message, type) {
    statusBox.textContent = message;
    statusBox.className = `form-status show ${type}`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusBox.classList.remove('show');

    if (!validate()) {
      showStatus('Please fill in the required fields correctly.', 'error');
      return;
    }

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
      company: form.company.value // honeypot, should stay empty
    };

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showStatus("Message sent — thanks for reaching out. I'll get back to you soon.", 'success');
        form.reset();
      } else {
        showStatus(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      showStatus("Couldn't reach the server. Please try again shortly, or email me directly.", 'error');
    } finally {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });

  ['name', 'email', 'message'].forEach(name => {
    form[name].addEventListener('input', () => setFieldError(name, false));
  });
});