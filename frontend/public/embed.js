// Lixyte — <vm-model> Custom Element wrapping <model-viewer>
if (!customElements.get('model-viewer')) {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
  document.head.appendChild(script);
}

class VmModelElement extends HTMLElement {
  connectedCallback() {
    const modelId = this.getAttribute('model-id');
    const key = this.getAttribute('key') || '';
    const cdnBase = this.getAttribute('cdn-base') || 'http://localhost:4001';
    const src = key
      ? `${cdnBase}/cdn/models/${modelId}/file.glb?key=${encodeURIComponent(key)}`
      : `${cdnBase}/cdn/models/${modelId}/preview.glb`;

    const viewer = document.createElement('model-viewer');
    viewer.setAttribute('src', src);
    viewer.style.width = 'var(--vm-width, 100%)';
    viewer.style.height = 'var(--vm-height, 400px)';

    ['auto-rotate', 'camera-controls', 'exposure', 'shadow-intensity', 'poster', 'loading'].forEach((attr) => {
      if (this.hasAttribute(attr)) {
        viewer.setAttribute(attr, this.getAttribute(attr) || '');
      }
    });

    this.innerHTML = '';
    this.appendChild(viewer);
  }
}

if (!customElements.get('vm-model')) {
  customElements.define('vm-model', VmModelElement);
}
