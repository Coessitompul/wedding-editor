import type { Editor } from 'grapesjs';

const SVG: Record<string, string> = {
  form: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 8h10v2H7V8zm0 4h7v2H7v-2z"/></svg>`,
  input: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 7a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H4zm1 2h14v6H5V9zm2 1v4h2V10H7zm4 0v4h6v-4h-6z"/></svg>`,
  textarea: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4zm1 2h14v10H5V7zm2 1v2h2V8H7zm0 3v2h2v-2H7zm0 3v2h5v-2H7zm7-6v2h3V8h-3zm0 3v2h3v-2h-3z"/></svg>`,
  select: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 7a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H4zm1 2h12v6H5V9zm14 3-2 2-2-2h4z"/></svg>`,
  button: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5zm0 2h14v4H5v-4zm3 1v2h8v-2H8z"/></svg>`,
  label: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/></svg>`,
  checkbox: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V5h14v14zm-8.29-3.29L7 12l1.41-1.41 2.3 2.3 5.88-5.88 1.41 1.41-7.3 7.29z"/></svg>`,
  radio: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`,
};

export const registerFormBlocks = (editor: Editor): void => {
  const bm = editor.BlockManager;
  // First block sets category with open:false; subsequent use string id
  const cat = { id: 'Forms', label: 'Forms', open: false };
  const catId = 'Forms';

  bm.add('form', {
    label: 'Form',
    category: cat,
    media: SVG.form,
    content: { type: 'form' },
  });

  bm.add('input', {
    label: 'Input',
    category: catId,
    media: SVG.input,
    content: { type: 'input' },
  });

  bm.add('textarea', {
    label: 'Textarea',
    category: catId,
    media: SVG.textarea,
    content: { type: 'textarea' },
  });

  bm.add('select', {
    label: 'Select',
    category: catId,
    media: SVG.select,
    content: { type: 'select' },
  });

  bm.add('button', {
    label: 'Button',
    category: catId,
    media: SVG.button,
    content: { type: 'button' },
  });

  bm.add('label', {
    label: 'Label',
    category: catId,
    media: SVG.label,
    content: { type: 'label' },
  });

  bm.add('checkbox', {
    label: 'Checkbox',
    category: catId,
    media: SVG.checkbox,
    content: { type: 'checkbox' },
  });

  bm.add('radio', {
    label: 'Radio',
    category: catId,
    media: SVG.radio,
    content: { type: 'radio' },
  });
};
