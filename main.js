// ── CONFIG ──
const SUPABASE_URL = 'https://iisfqcyynckwojplgyxn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AQ__x3vlBbEYjlFbw4niLw_33M-onUX';

// ── NAVBAR: scroll border + mobile toggle ──
const navbar   = document.getElementById('navbar');
const navLinks = document.getElementById('navLinks');
const toggle   = document.getElementById('mobileToggle');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
});

toggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  toggle.textContent = open ? '✕' : '☰';
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.textContent = '☰';
  });
});

// ── TOAST utility ──
function showToast(msg, duration = 3500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── WAITLIST FORM → Supabase ──
const form = document.getElementById('waitlistForm');
const msg  = document.getElementById('waitlistMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email  = document.getElementById('waitlistEmail').value.trim();
  const button = form.querySelector('button');

  button.textContent = '...';
  button.disabled = true;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify({ email })
    });

    if (res.ok) {
      form.style.display = 'none';
      msg.style.display  = 'block';
      showToast('Danke! Sie stehen auf der Liste.');
    } else if (res.status === 409) {
      // unique constraint — already signed up
      showToast('Diese E-Mail-Adresse ist bereits eingetragen.');
      button.textContent = 'Updates erhalten';
      button.disabled = false;
    } else {
      throw new Error(`Status ${res.status}`);
    }
  } catch (err) {
    console.error('Waitlist error:', err);
    showToast('Etwas hat nicht geklappt. Bitte versuchen Sie es erneut.');
    button.textContent = 'Updates erhalten';
    button.disabled = false;
  }
});

// ── CONTACT MODAL ──
const overlay       = document.getElementById('contactOverlay');
const openContact   = document.getElementById('openContact');
const modalClose    = document.getElementById('modalClose');
const contactSubmit = document.getElementById('contactSubmit');
const charCount     = document.getElementById('charCount');
const contactMsg    = document.getElementById('contactMessage');
const modalForm     = document.getElementById('modalForm');
const modalSuccess  = document.getElementById('modalSuccess');

function openModal() {
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

openContact.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Character counter
contactMsg.addEventListener('input', () => {
  const len = contactMsg.value.length;
  charCount.textContent = `${len} / 500`;
  charCount.classList.toggle('warn', len >= 400 && len < 500);
  charCount.classList.toggle('over', len >= 500);
});

// Contact form submit → Supabase
contactSubmit.addEventListener('click', async () => {
  const name     = document.getElementById('contactName').value.trim();
  const email    = document.getElementById('contactEmail').value.trim();
  const position = document.getElementById('contactPosition').value.trim();
  const message  = contactMsg.value.trim();

  if (!name || !email || !message) {
    showToast('Bitte füllen Sie alle Pflichtfelder aus.');
    return;
  }

  contactSubmit.textContent = '...';
  contactSubmit.disabled = true;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/contact`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify({ name, email, position: position || null, message })
    });

    if (res.ok) {
      modalForm.style.display    = 'none';
      modalSuccess.style.display = 'block';
      setTimeout(closeModal, 2800);
      // reset for next time
      setTimeout(() => {
        modalForm.style.display    = 'block';
        modalSuccess.style.display = 'none';
        document.getElementById('contactName').value     = '';
        document.getElementById('contactEmail').value    = '';
        document.getElementById('contactPosition').value = '';
        contactMsg.value = '';
        charCount.textContent = '0 / 500';
        contactSubmit.textContent = 'Nachricht senden';
        contactSubmit.disabled = false;
      }, 3200);
    } else {
      throw new Error(`Status ${res.status}`);
    }
  } catch (err) {
    console.error('Contact error:', err);
    showToast('Etwas hat nicht geklappt. Bitte versuchen Sie es erneut.');
    contactSubmit.textContent = 'Nachricht senden';
    contactSubmit.disabled = false;
  }
});

// ── SCROLL TO TOP ──
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── SCROLL ANIMATION: fade-in on enter ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.problem-card, .solution-card, .step, .persona-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});