const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

if (csrfToken) {
  document.querySelectorAll('form[method="post"], form[method="POST"]').forEach((form) => {
    if (!form.querySelector('input[name="_csrf"]')) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = '_csrf';
      input.value = csrfToken;
      form.appendChild(input);
    }
  });
}

const navToggle = document.querySelector('[data-nav-toggle]');
const siteNav = document.querySelector('[data-site-nav]');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    siteNav.classList.toggle('open');
  });
}

document.querySelectorAll('form[onsubmit]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    const message = form.getAttribute('onsubmit').match(/confirm\('(.+)'\)/);
    if (message && !window.confirm(message[1])) {
      event.preventDefault();
    }
  });
  form.removeAttribute('onsubmit');
});
