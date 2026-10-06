/* =====================================================
   App Controller — Velox Code
   Main application logic, event wiring, persistence
   ===================================================== */
(function () {
  'use strict';

  // ── Theme ─────────────────────────────────────────
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let isDark = localStorage.getItem('velox-theme')
    ? localStorage.getItem('velox-theme') === 'dark'
    : prefersDark !== false;  // default dark

  function applyTheme(dark) {
    isDark = dark;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('velox-theme', dark ? 'dark' : 'light');

    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.dataset.feather = dark ? 'moon' : 'sun';
      feather.replace({ 'stroke-width': 1.75 });
    }

    window.veloxEditor?.setTheme(dark);
  }

  // Apply theme immediately before render
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';

  // ── Init after DOM ─────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {

    // Init feather icons
    feather.replace({ 'stroke-width': 1.75 });

    // Init i18n
    window.i18n.applyAll();

    // Init Monaco editor
    window.veloxEditor.init();

    // Apply saved settings to UI
    _applySavedSettings();

    // ── Bind Events ──────────────────────────────────

    // Language tabs
    document.querySelectorAll('.lang-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        document.querySelectorAll('.lang-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.veloxEditor?.setLanguage(lang);
      });
    });

    // Mobile hamburger + sidebar
    const sidebar  = document.getElementById('sidebar');
    const overlay  = document.getElementById('overlay');
    const menuBtn  = document.getElementById('menuToggle');
    const closeBtn = document.getElementById('closeSidebar');

    function openSidebar()  { sidebar.classList.add('open');  overlay.classList.add('show'); }
    function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }

    menuBtn?.addEventListener('click', openSidebar);
    closeBtn?.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Also show mobile lang tabs in sidebar
    document.querySelectorAll('.snippet-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const snippetKey = btn.dataset.snippet;
        const lang = btn.dataset.lang;
        const snippet = VeloxSnippets[snippetKey];
        if (!snippet) return;

        // Switch tab
        document.querySelectorAll('.lang-tab').forEach(b => {
          b.classList.toggle('active', b.dataset.lang === lang);
        });

        window.veloxEditor?.setValue(snippet.code, lang);
        closeSidebar();

        // Highlight active snippet
        document.querySelectorAll('.snippet-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', () => {
      applyTheme(!isDark);
    });

    // Run button
    document.getElementById('runBtn')?.addEventListener('click', () => {
      window.veloxRunner?.run();
    });

    // Format button
    document.getElementById('formatBtn')?.addEventListener('click', () => {
      window.veloxEditor?.format();
      showToast(window.i18n.t('toast.formatted'), 'success');
    });

    // Copy button
    document.getElementById('copyBtn')?.addEventListener('click', async () => {
      const code = window.veloxEditor?.getValue() || '';
      try {
        await navigator.clipboard.writeText(code);
        showToast(window.i18n.t('toast.copied'), 'success');
      } catch {
        showToast('Copy failed', 'error');
      }
    });

    // Clear editor
    document.getElementById('clearBtn')?.addEventListener('click', () => {
      window.veloxEditor?.setValue('');
      showToast(window.i18n.t('toast.cleared'));
    });

    // Clear output
    document.getElementById('clearOutputBtn')?.addEventListener('click', () => {
      const out = document.getElementById('consoleOutput');
      out.innerHTML = `<div class="console-welcome">
        <div class="welcome-icon">⚡</div>
        <p class="welcome-text">${window.i18n.t('output.welcome')}</p>
      </div>`;
      document.getElementById('execTime').textContent = '';
      document.getElementById('statusMsg').textContent = '';
    });

    // Output tabs
    document.getElementById('tabConsole')?.addEventListener('click', () => {
      document.getElementById('tabConsole').classList.add('active');
      document.getElementById('tabPreview').classList.remove('active');
      document.getElementById('consoleOutput').classList.remove('hidden');
      document.getElementById('previewFrame').classList.add('hidden');
    });

    document.getElementById('tabPreview')?.addEventListener('click', () => {
      document.getElementById('tabPreview').classList.add('active');
      document.getElementById('tabConsole').classList.remove('active');
      document.getElementById('previewFrame').classList.remove('hidden');
      document.getElementById('consoleOutput').classList.add('hidden');
    });

    // Fullscreen preview
    document.getElementById('fullscreenPreviewBtn')?.addEventListener('click', () => {
      const frame = document.getElementById('previewFrame');
      if (frame.requestFullscreen) frame.requestFullscreen();
    });

    // Settings modal
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
      document.getElementById('settingsModal').classList.add('open');
    });
    document.getElementById('closeSettings')?.addEventListener('click', () => {
      document.getElementById('settingsModal').classList.remove('open');
    });
    document.getElementById('settingsModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
    });

    // Settings controls
    const fontSlider = document.getElementById('fontSizeSlider');
    const fontValue  = document.getElementById('fontSizeValue');
    if (fontSlider) {
      fontSlider.value = window.veloxEditor.fontSize;
      fontValue.textContent = `${window.veloxEditor.fontSize}px`;
      fontSlider.addEventListener('input', () => {
        const v = parseInt(fontSlider.value);
        fontValue.textContent = `${v}px`;
        window.veloxEditor?.updateOption('fontSize', v);
      });
    }

    const tabSel = document.getElementById('tabSizeSelect');
    if (tabSel) {
      tabSel.value = String(window.veloxEditor.tabSize);
      tabSel.addEventListener('change', () => {
        window.veloxEditor?.updateOption('tabSize', parseInt(tabSel.value));
      });
    }

    const minimapToggle = document.getElementById('minimapToggle');
    if (minimapToggle) {
      minimapToggle.checked = window.veloxEditor.minimap;
      minimapToggle.addEventListener('change', () => {
        window.veloxEditor?.updateOption('minimap', minimapToggle.checked);
      });
    }

    const wordWrapToggle = document.getElementById('wordWrapToggle');
    if (wordWrapToggle) {
      wordWrapToggle.checked = window.veloxEditor.wordWrap;
      wordWrapToggle.addEventListener('change', () => {
        window.veloxEditor?.updateOption('wordWrap', wordWrapToggle.checked);
      });
    }

    const autoRunToggle = document.getElementById('autoRunToggle');
    if (autoRunToggle) {
      autoRunToggle.checked = window.veloxEditor.autoRun;
      autoRunToggle.addEventListener('change', () => {
        window.veloxEditor?.updateOption('autoRun', autoRunToggle.checked);
      });
    }

    // Share modal
    document.getElementById('shareBtn')?.addEventListener('click', () => {
      const state = window.veloxEditor?.encodeState() || '';
      const url   = `${location.origin}${location.pathname}#${state}`;
      document.getElementById('shareUrl').value = url;
      document.getElementById('shareModal').classList.add('open');
    });
    document.getElementById('closeShare')?.addEventListener('click', () => {
      document.getElementById('shareModal').classList.remove('open');
    });
    document.getElementById('shareModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
    });
    document.getElementById('copyShareUrl')?.addEventListener('click', async () => {
      const url = document.getElementById('shareUrl').value;
      try {
        await navigator.clipboard.writeText(url);
        showToast(window.i18n.t('toast.shared'), 'success');
        document.getElementById('shareModal').classList.remove('open');
      } catch {
        showToast('Copy failed', 'error');
      }
    });

    // Locale switcher
    document.querySelectorAll('.locale-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const locale = btn.dataset.locale;
        window.i18n.setLocale(locale);
        document.querySelectorAll('.locale-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.locale === locale);
        });
      });
    });

    // Apply saved locale
    document.querySelectorAll('.locale-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.locale === window.i18n.locale);
    });

    // Draggable resizer
    _initResizer();

    // Apply theme properly (with feather icons redrawn)
    applyTheme(isDark);

    // Mobile lang tabs in sidebar (show lang tabs as buttons)
    _addMobileLangTabsToSidebar();
  });

  // ── Resizer ────────────────────────────────────────
  function _initResizer() {
    const resizer = document.getElementById('resizer');
    const editorPanel = document.getElementById('editorPanel');
    const outputPanel = document.getElementById('outputPanel');
    const isMobile = () => window.innerWidth <= 768;

    let startX, startY, startEditorSize, startOutputSize;

    resizer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      resizer.classList.add('dragging');
      document.body.style.cursor = isMobile() ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';

      if (isMobile()) {
        startY = e.clientY;
        startEditorSize = editorPanel.getBoundingClientRect().height;
        startOutputSize = outputPanel.getBoundingClientRect().height;
      } else {
        startX = e.clientX;
        startEditorSize = editorPanel.getBoundingClientRect().width;
        startOutputSize = outputPanel.getBoundingClientRect().width;
      }

      const onMove = (e) => {
        if (isMobile()) {
          const dy = e.clientY - startY;
          const total = startEditorSize + startOutputSize;
          const newEditor = Math.max(100, Math.min(total - 100, startEditorSize + dy));
          editorPanel.style.height  = newEditor + 'px';
          outputPanel.style.height  = (total - newEditor) + 'px';
          editorPanel.style.flex = 'none';
          outputPanel.style.flex = 'none';
        } else {
          const dx = e.clientX - startX;
          const total = startEditorSize + startOutputSize;
          const newEditor = Math.max(200, Math.min(total - 200, startEditorSize + dx));
          editorPanel.style.flex = 'none';
          editorPanel.style.width = newEditor + 'px';
          outputPanel.style.flex = '1';
        }
        window.veloxEditor?.editor?.layout();
      };

      const onUp = () => {
        resizer.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup',   onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup',   onUp);
    });

    // Touch support
    resizer.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      resizer.classList.add('dragging');

      if (isMobile()) {
        startY = touch.clientY;
        startEditorSize = editorPanel.getBoundingClientRect().height;
        startOutputSize = outputPanel.getBoundingClientRect().height;
      } else {
        startX = touch.clientX;
        startEditorSize = editorPanel.getBoundingClientRect().width;
        startOutputSize = outputPanel.getBoundingClientRect().width;
      }

      const onTouchMove = (e) => {
        const t = e.touches[0];
        if (isMobile()) {
          const dy = t.clientY - startY;
          const total = startEditorSize + startOutputSize;
          const newEditor = Math.max(100, Math.min(total - 100, startEditorSize + dy));
          editorPanel.style.height = newEditor + 'px';
          outputPanel.style.height = (total - newEditor) + 'px';
          editorPanel.style.flex = 'none';
          outputPanel.style.flex = 'none';
        } else {
          const dx = t.clientX - startX;
          const total = startEditorSize + startOutputSize;
          const newEditor = Math.max(200, Math.min(total - 200, startEditorSize + dx));
          editorPanel.style.flex = 'none';
          editorPanel.style.width = newEditor + 'px';
        }
        window.veloxEditor?.editor?.layout();
      };

      const onTouchEnd = () => {
        resizer.classList.remove('dragging');
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend',  onTouchEnd);
      };

      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend',  onTouchEnd);
    }, { passive: true });
  }

  // ── Mobile: Show lang tabs in sidebar top ─────────
  function _addMobileLangTabsToSidebar() {
    const sidebar = document.getElementById('sidebar');
    const langBar = document.createElement('div');
    langBar.className = 'sidebar-lang-tabs';
    langBar.style.cssText = `
      display: flex; gap: 6px; padding: 12px 12px 0;
    `;

    ['dart', 'html', 'javascript'].forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'lang-tab' + (lang === window.veloxEditor?.currentLang ? ' active' : '');
      btn.style.cssText = 'flex:1;justify-content:center;font-size:12px;';
      btn.textContent = { dart: 'Dart', html: 'HTML', javascript: 'JS' }[lang];
      btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-tab').forEach(b => b.classList.remove('active'));
        langBar.querySelectorAll('.lang-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('#langTabs .lang-tab').forEach(b => {
          b.classList.toggle('active', b.dataset.lang === lang);
        });
        window.veloxEditor?.setLanguage(lang);
      });
      langBar.appendChild(btn);
    });

    sidebar.insertBefore(langBar, sidebar.querySelector('.sidebar-content'));
  }

  // ── Settings persistence ───────────────────────────
  function _applySavedSettings() {
    const locale = localStorage.getItem('velox-locale') || 'en';
    document.querySelectorAll('.locale-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.locale === locale);
    });
  }

  // ── Toast ──────────────────────────────────────────
  window.showToast = function(msg, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast show' + (type ? ` ${type}` : '');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
  };

})();
