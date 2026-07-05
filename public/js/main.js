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

    if (form.enctype === 'multipart/form-data') {
      const actionUrl = new URL(form.getAttribute('action') || window.location.href, window.location.origin);
      if (!actionUrl.searchParams.has('_csrf')) {
        actionUrl.searchParams.set('_csrf', csrfToken);
        form.setAttribute('action', `${actionUrl.pathname}${actionUrl.search}${actionUrl.hash}`);
      }
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

function renderPreviewText(value) {
  const cleaned = value.trim();
  if (!cleaned) return '';
  return cleaned
    .replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]))
    .replace(/\n/g, '<br>');
}

document.querySelectorAll('[data-preview-form]').forEach((form) => {
  const syncField = (field) => {
    const key = field.dataset.previewTarget;
    if (!key) return;

    const output = form.closest('.editor-preview-layout')?.querySelector(`[data-preview-output="${key}"]`);
    if (!output) return;

    const fallback = output.dataset.previewFallback || '';
    const html = renderPreviewText(field.value) || renderPreviewText(fallback);
    output.innerHTML = html;
  };

  form.querySelectorAll('[data-preview-target]').forEach((field) => {
    const key = field.dataset.previewTarget;
    const output = form.closest('.editor-preview-layout')?.querySelector(`[data-preview-output="${key}"]`);
    if (output && !output.dataset.previewFallback) {
      output.dataset.previewFallback = output.textContent.trim();
    }
    syncField(field);
    field.addEventListener('input', () => syncField(field));
    field.addEventListener('change', () => syncField(field));
  });

  const imageInput = form.querySelector('[data-preview-image-input]');
  const previewImage = form.closest('.editor-preview-layout')?.querySelector('[data-preview-image]');

  if (imageInput && previewImage) {
    imageInput.addEventListener('change', () => {
      const [file] = imageInput.files;
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      previewImage.src = objectUrl;
      previewImage.onload = () => URL.revokeObjectURL(objectUrl);
    });
  }
});
