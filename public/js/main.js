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

