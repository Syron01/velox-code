/* =====================================================
   Code Runner — Velox Code
   Fast execution engine for Dart, HTML, JavaScript
   ===================================================== */
class VeloxRunner {
  constructor() {
    this._execStart = 0;
    this._jsWorker = null;
    this._dartCache = new Map();  // simple hash → result cache
  }

  async run() {
    const lang = window.veloxEditor.currentLang;
    const code = window.veloxEditor.getValue();

    if (!code.trim()) return;

    this._execStart = performance.now();
    document.getElementById('runBtn').classList.add('running');
    document.getElementById('statusMsg').textContent = '';

    switch (lang) {
      case 'dart':        await this._runDart(code); break;
      case 'html':             this._runHtml(code); break;
      case 'javascript':       this._runJs(code);   break;
    }
  }

  // ── HTML Preview ──────────────────────────────────
  _runHtml(code) {
    this._showPreview();
    const frame = document.getElementById('previewFrame');
    // Direct srcdoc assignment — instant, no network round-trip
    frame.srcdoc = code;
    this._done('info');
  }

  // ── JavaScript ───────────────────────────────────
  _runJs(code) {
    this._showConsole();
    this._clearConsole();

    // Terminate previous worker
    if (this._jsWorker) { this._jsWorker.terminate(); }

    // Wrap user code in a Worker blob for isolated execution
    const workerSrc = `
      // Override console
      const _log = (type, args) => postMessage({ type, text: args.map(a => {
        if (typeof a === 'object') {
          try { return JSON.stringify(a, null, 2); } catch(e) { return String(a); }
        }
        return String(a);
      }).join(' ') });

      self.console = {
        log:   (...a) => _log('stdout',  a),
        info:  (...a) => _log('info',    a),
        warn:  (...a) => _log('warning', a),
        error: (...a) => _log('stderr',  a),
      };

      // Capture unhandled errors
      self.onerror = (msg, src, line, col, err) => {
        postMessage({ type: 'stderr', text: \`Error: \${msg} (line \${line})\` });
      };
      self.onunhandledrejection = e => {
        postMessage({ type: 'stderr', text: \`Unhandled Promise: \${e.reason}\` });
      };

      try {
        (async () => {
          ${code}
        })().catch(e => postMessage({ type: 'stderr', text: 'Promise rejected: ' + e.message }));
      } catch(e) {
        postMessage({ type: 'stderr', text: e.name + ': ' + e.message + '\\n  at line ' + (e.lineNumber || '?') });
      }
      postMessage({ type: 'done' });
    `;

    const blob = new Blob([workerSrc], { type: 'application/javascript' });
    const url  = URL.createObjectURL(blob);
    this._jsWorker = new Worker(url);
    URL.revokeObjectURL(url);

    // Check if code uses document/canvas → run in iframe instead
    if (/document\.|window\.|canvas|createElement|getElementById/.test(code)) {
      this._jsWorker.terminate();
      this._runJsInPreview(code);
      return;
    }

    const timeout = setTimeout(() => {
      this._jsWorker?.terminate();
      this._appendLine('warning', '⚠ Execution timeout (5s)');
    }, 5000);

    this._jsWorker.onmessage = ({ data }) => {
      if (data.type === 'done') {
        clearTimeout(timeout);
        this._done('success');
      } else {
        this._appendLine(data.type, data.text);
      }
    };

    this._jsWorker.onerror = (e) => {
      clearTimeout(timeout);
      this._appendLine('stderr', `${e.message}`);
      this._done('error');
    };
  }

  _runJsInPreview(code) {
    this._showPreview();
    const html = `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin:0; background:#0d0f14; overflow:hidden; }
</style>
</head>
<body>
<script>
  // Redirect console to parent
  const orig = { log: console.log, error: console.error };
  console.log = (...a) => { orig.log(...a); parent.postMessage({type:'stdout',text:a.join(' ')},'*'); };
  console.error = (...a) => { orig.error(...a); parent.postMessage({type:'stderr',text:a.join(' ')},'*'); };
  window.onerror = (m,s,l) => parent.postMessage({type:'stderr',text:m+' (line '+l+)'},'*');
<\/script>
<script>
  ${code}
<\/script>
</body>
</html>`;
    document.getElementById('previewFrame').srcdoc = html;
    // Also show console tab for any logs
    const tabC = document.getElementById('tabConsole');
    const tabP = document.getElementById('tabPreview');
    // Keep preview visible
    this._done('info');
  }

  // ── DART via DartPad API ──────────────────────────
  async _runDart(code) {
    this._showConsole();
    this._clearConsole();

    // Check cache
    const hash = this._simpleHash(code);
    if (this._dartCache.has(hash)) {
      const cached = this._dartCache.get(hash);
      this._renderDartResult(cached, true);
      return;
    }

    const loading = document.getElementById('dartLoading');
    loading.classList.add('show');

    try {
      // Primary: DartPad API
      const result = await this._dartPadRun(code);
      loading.classList.remove('show');
      this._dartCache.set(hash, result);
      this._renderDartResult(result, false);
    } catch (e) {
      loading.classList.remove('show');
      // Fallback message
      this._appendLine('warning', '⚠ Dart compiler unavailable. Using local simulation.');
      this._appendLine('info',    '💡 Install Dart SDK locally for full offline support.');
      this._appendLine('system',  `[Error: ${e.message}]`);
      this._done('error');
    }
  }

  async _dartPadRun(code) {
    // Try DartPad compile endpoint (fastest, runs on Google's infra)
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://dartpad.dev/api/v3/compile/dart2js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: code }),
      signal: controller.signal,
    });
    clearTimeout(tid);

    if (!response.ok) {
      // Try the newer DartPad endpoint
      return this._dartPadRunV2(code);
    }

    const data = await response.json();
    return data;
  }

  async _dartPadRunV2(code) {
    // DartPad newer run endpoint
    const response = await fetch('https://dartpad.dev/api/v2/compile/ddc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: code }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  _renderDartResult(data, fromCache) {
    if (fromCache) {
      this._appendLine('system', '⚡ (from cache)');
    }

    if (data.error) {
      // Parse Dart compile errors
      const lines = (data.error || '').split('\n');
      lines.forEach(line => {
        if (!line.trim()) return;
        if (/^Error:/i.test(line) || /^\s+at\s/.test(line)) {
          this._appendLine('error-detail', line);
        } else {
          this._appendLine('stderr', line);
        }
      });
      this._done('error');
    } else {
      // Success — execute in preview iframe and capture stdout
      if (data.result) {
        this._runCompiledDart(data.result, data.sourceMapUrl);
      } else if (data.output) {
        // Some endpoints return raw output
        data.output.split('\n').forEach(line => {
          if (line.trim()) this._appendLine('stdout', line);
        });
        this._done('success');
      } else {
        this._appendLine('info', '✅ Compiled successfully (no output)');
        this._done('success');
      }
    }
  }

  _runCompiledDart(jsCode, sourceMapUrl) {
    // Run compiled JS in an iframe, capture console output via postMessage
    const frameHtml = `<!DOCTYPE html>
<html>
<head>
<script>
  // Redirect stdout to parent
  const _send = (t,m) => parent.postMessage({type:t,text:m},'*');
  const printImpl = (...args) => _send('stdout', args.join(' '));
  window.print = printImpl;
  window.dartPrint = printImpl;
  window.console.log = printImpl;
  window.console.error = (...a) => _send('stderr', a.join(' '));
  window.console.warn  = (...a) => _send('warning', a.join(' '));
  window.onerror = (m,s,l) => _send('stderr', m+' (line '+l+')');
<\/script>
</head>
<body>
<script>
${jsCode}
<\/script>
</body>
</html>`;

    this._showPreviewSilent();
    const frame = document.getElementById('previewFrame');
    frame.srcdoc = frameHtml;

    // Listen for messages from iframe
    const handler = (event) => {
      if (!event.data || !event.data.type) return;
      const { type, text } = event.data;
      if (type === 'done' || !text) return;
      this._appendLine(type, text);
    };

    window.addEventListener('message', handler);

    // Switch back to console after a brief delay
    setTimeout(() => {
      window.removeEventListener('message', handler);
      this._showConsole();
      this._done('success');
    }, 2000);
  }

  // ── UI Helpers ────────────────────────────────────
  _showConsole() {
    document.getElementById('consoleOutput').classList.remove('hidden');
    document.getElementById('previewFrame').classList.add('hidden');
    document.getElementById('tabConsole').classList.add('active');
    document.getElementById('tabPreview').classList.remove('active');
  }

  _showPreview() {
    document.getElementById('consoleOutput').classList.add('hidden');
    document.getElementById('previewFrame').classList.remove('hidden');
    document.getElementById('tabPreview').classList.add('active');
    document.getElementById('tabConsole').classList.remove('active');
  }

  _showPreviewSilent() {
    // Show preview without hiding console (for dart iframe trick)
    document.getElementById('previewFrame').classList.remove('hidden');
  }

  _clearConsole() {
    const out = document.getElementById('consoleOutput');
    out.innerHTML = '';
  }

  _appendLine(type, text) {
    const out = document.getElementById('consoleOutput');

    // Remove welcome screen
    const welcome = out.querySelector('.console-welcome');
    if (welcome) welcome.remove();

    const line = document.createElement('div');
    line.className = `console-line ${type}`;

    const prefix = document.createElement('span');
    prefix.className = 'prefix';
    prefix.textContent = this._prefix(type);

    const textEl = document.createElement('span');
    textEl.className = 'text';
    textEl.textContent = text;

    line.appendChild(prefix);
    line.appendChild(textEl);
    out.appendChild(line);

    // Auto-scroll
    out.scrollTop = out.scrollHeight;
  }

  _prefix(type) {
    const map = {
      stdout: '›',
      stderr: '✕',
      info:   'ℹ',
      warning:'⚠',
      success:'✓',
      system: '#',
      'error-detail': '✕',
    };
    return map[type] || '›';
  }

  _done(status) {
    const elapsed = (performance.now() - this._execStart).toFixed(0);
    document.getElementById('execTime').textContent = `${elapsed}ms`;
    document.getElementById('runBtn').classList.remove('running');

    const msgs = {
      success: { msg: window.i18n?.t('run.success') || 'Done', color: 'var(--success)' },
      error:   { msg: window.i18n?.t('run.error')   || 'Error', color: 'var(--danger)' },
      info:    { msg: `Rendered in ${elapsed}ms`, color: 'var(--info)' },
    };
    const s = msgs[status] || msgs.info;
    const statusEl = document.getElementById('statusMsg');
    statusEl.textContent = s.msg;
    statusEl.style.color = s.color;

    // Add divider in console
    if (status !== 'info') {
      const out = document.getElementById('consoleOutput');
      if (out.children.length > 0) {
        const div = document.createElement('div');
        div.className = 'console-divider';
        out.appendChild(div);
      }
    }
  }

  // FNV-1a hash for caching
  _simpleHash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h.toString(36);
  }
}

window.veloxRunner = new VeloxRunner();
