/* =====================================================
   Monaco Editor Manager — Velox Code
   ===================================================== */
class VeloxEditor {
  constructor() {
    this.editor = null;
    this.currentLang = 'dart';
    this.codeStore = {
      dart: VeloxSnippets.dart_hello.code,
      html: VeloxSnippets.html_card.code,
      javascript: VeloxSnippets.js_canvas.code,
    };
    this.fontSize = parseInt(localStorage.getItem('velox-fontSize') || '14');
    this.tabSize = parseInt(localStorage.getItem('velox-tabSize') || '4');
    this.wordWrap = (localStorage.getItem('velox-wordWrap') !== 'false');
    this.minimap = (localStorage.getItem('velox-minimap') === 'true');
    this.autoRun = (localStorage.getItem('velox-autoRun') === 'true');
    this._autoRunTimer = null;
  }

  init() {
    require.config({
      paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }
    });

    require(['vs/editor/editor.main'], () => {
      this._defineTheme();
      this._createEditor();
      this._bindEditorEvents();
      this._loadFromUrl();
    });
  }

  _defineTheme() {
    // Soft dark Material theme
    monaco.editor.defineTheme('velox-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword',        foreground: 'c792ea', fontStyle: 'bold' },
        { token: 'keyword.control',foreground: 'c792ea', fontStyle: 'bold' },
        { token: 'string',         foreground: 'a5e075' },
        { token: 'string.escape',  foreground: 'ffcb6b' },
        { token: 'comment',        foreground: '546e7a', fontStyle: 'italic' },
        { token: 'number',         foreground: 'f78c6c' },
        { token: 'delimiter',      foreground: '89ddff' },
        { token: 'type',           foreground: 'ffcb6b' },
        { token: 'variable',       foreground: 'e8eaf6' },
        { token: 'function',       foreground: '82aaff' },
        { token: 'tag',            foreground: 'ff6b6b' },
        { token: 'attribute.name', foreground: 'ffcb6b' },
        { token: 'attribute.value',foreground: 'a5e075' },
      ],
      colors: {
        'editor.background':           '#0d0f14',
        'editor.foreground':           '#e8eaf6',
        'editor.lineHighlightBackground': '#1e2330',
        'editorLineNumber.foreground': '#3d4466',
        'editorLineNumber.activeForeground': '#6b8cff',
        'editorCursor.foreground':     '#6b8cff',
        'editor.selectionBackground':  '#2d3557',
        'editorIndentGuide.background':'#1e2330',
        'editorIndentGuide.activeBackground': '#3d4466',
        'scrollbarSlider.background':  '#1e233080',
        'scrollbarSlider.hoverBackground': '#6b8cff40',
        'editorWidget.background':     '#181c25',
        'editorWidget.border':         '#1e2330',
        'list.hoverBackground':        '#1e2330',
        'list.activeSelectionBackground': '#2d3557',
        'editorSuggestWidget.background': '#181c25',
        'editorSuggestWidget.border':  '#6b8cff30',
        'editorSuggestWidget.selectedBackground': '#2d3557',
      }
    });

    // Light theme
    monaco.editor.defineTheme('velox-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword',  foreground: '7c3aed', fontStyle: 'bold' },
        { token: 'string',   foreground: '15803d' },
        { token: 'comment',  foreground: '94a3b8', fontStyle: 'italic' },
        { token: 'number',   foreground: 'ea580c' },
        { token: 'type',     foreground: '0369a1' },
        { token: 'function', foreground: '2563eb' },
      ],
      colors: {
        'editor.background': '#f8faff',
        'editor.foreground': '#1a1f3c',
        'editor.lineHighlightBackground': '#eef1ff',
        'editorCursor.foreground': '#4466ee',
        'editor.selectionBackground': '#c7d2fe',
      }
    });
  }

  _createEditor() {
    const isDark = document.documentElement.dataset.theme !== 'light';

    this.editor = monaco.editor.create(document.getElementById('monacoContainer'), {
      value: this.codeStore[this.currentLang],
      language: this.currentLang,
      theme: isDark ? 'velox-dark' : 'velox-light',
      fontSize: this.fontSize,
      fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace",
      fontLigatures: true,
      lineHeight: 22,
      tabSize: this.tabSize,
      minimap: { enabled: this.minimap },
      wordWrap: this.wordWrap ? 'on' : 'off',
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      renderLineHighlight: 'gutter',
      bracketPairColorization: { enabled: true },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      formatOnPaste: true,
      folding: true,
      showUnused: true,
      padding: { top: 12, bottom: 12 },
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      glyphMargin: false,
      renderFinalNewline: 'on',
    });
  }

  _bindEditorEvents() {
    // Cursor position
    this.editor.onDidChangeCursorPosition(e => {
      document.getElementById('cursorPos').textContent =
        `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
    });

    // Auto-run on change
    this.editor.onDidChangeModelContent(() => {
      if (this.autoRun) {
        clearTimeout(this._autoRunTimer);
        this._autoRunTimer = setTimeout(() => {
          window.veloxRunner?.run();
        }, 800);
      }
    });

    // Shortcut: Shift+Enter → run
    this.editor.addCommand(
      monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => { window.veloxRunner?.run(); }
    );

    // Responsive resize
    window.addEventListener('resize', () => this.editor.layout());
    new ResizeObserver(() => this.editor.layout())
      .observe(document.getElementById('monacoContainer'));
  }

  setLanguage(lang) {
    this.codeStore[this.currentLang] = this.editor.getValue();
    this.currentLang = lang;
    const model = this.editor.getModel();
    monaco.editor.setModelLanguage(model, lang);
    this.editor.setValue(this.codeStore[lang]);
    document.getElementById('langBadge').textContent =
      { dart:'Dart', html:'HTML', javascript:'JavaScript' }[lang] || lang;
  }

  getValue() { return this.editor.getValue(); }

  setValue(code, lang) {
    if (lang && lang !== this.currentLang) {
      this.currentLang = lang;
      const model = this.editor.getModel();
      monaco.editor.setModelLanguage(model, lang);
    }
    this.editor.setValue(code);
    this.codeStore[lang || this.currentLang] = code;
  }

  format() {
    this.editor.getAction('editor.action.formatDocument')?.run();
  }

  setTheme(isDark) {
    this.editor.updateOptions({ theme: isDark ? 'velox-dark' : 'velox-light' });
  }

  updateOption(key, value) {
    const opts = {};
    if (key === 'fontSize')  { this.fontSize = value;  opts.fontSize = value;  localStorage.setItem('velox-fontSize', value); }
    if (key === 'tabSize')   { this.tabSize = value;    opts.tabSize = value;   localStorage.setItem('velox-tabSize', value); }
    if (key === 'minimap')   { this.minimap = value;    opts.minimap = { enabled: value }; localStorage.setItem('velox-minimap', value); }
    if (key === 'wordWrap')  { this.wordWrap = value;   opts.wordWrap = value ? 'on' : 'off'; localStorage.setItem('velox-wordWrap', value); }
    if (key === 'autoRun')   { this.autoRun = value;    localStorage.setItem('velox-autoRun', value); }
    if (Object.keys(opts).length) this.editor.updateOptions(opts);
  }

  // URL state encode/decode
  encodeState() {
    const state = {
      lang: this.currentLang,
      code: this.editor.getValue()
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  }

  _loadFromUrl() {
    try {
      const hash = location.hash.slice(1);
      if (!hash) return;
      const state = JSON.parse(decodeURIComponent(escape(atob(hash))));
      if (state.lang && state.code) {
        this.setValue(state.code, state.lang);
        // Switch tab
        document.querySelectorAll('.lang-tab').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.lang === state.lang);
        });
      }
    } catch (e) { /* ignore */ }
  }
}

window.veloxEditor = new VeloxEditor();
