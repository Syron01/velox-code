/* =====================================================
   i18n strings — Velox Code
   ===================================================== */
window.VeloxI18n = {
  en: {
    "sidebar.examples": "Examples",
    "editor.title": "Editor",
    "editor.run": "Run",
    "output.title": "Output",
    "output.console": "Console",
    "output.preview": "Preview",
    "output.welcome": "Press Shift+Enter or click Run to execute your code.",
    "settings.title": "Settings",
    "settings.fontSize": "Font Size",
    "settings.tabSize": "Tab Size",
    "settings.minimap": "Minimap",
    "settings.wordWrap": "Word Wrap",
    "settings.autoRun": "Auto-run on change",
    "share.title": "Share Snippet",
    "share.info": "Your code is encoded in the URL — share it with anyone!",
    "dart.compiling": "Compiling Dart…",
    "toast.copied": "Copied to clipboard!",
    "toast.shared": "Share link copied!",
    "toast.cleared": "Editor cleared",
    "toast.formatted": "Code formatted",
    "run.success": "Executed successfully",
    "run.error": "Runtime error",
    "console.clear": "Console cleared",
  },
  tr: {
    "sidebar.examples": "Örnekler",
    "editor.title": "Editör",
    "editor.run": "Çalıştır",
    "output.title": "Çıktı",
    "output.console": "Konsol",
    "output.preview": "Önizleme",
    "output.welcome": "Kodunu çalıştırmak için Shift+Enter'a bas veya Çalıştır'a tıkla.",
    "settings.title": "Ayarlar",
    "settings.fontSize": "Yazı Boyutu",
    "settings.tabSize": "Sekme Boyutu",
    "settings.minimap": "Minimap",
    "settings.wordWrap": "Kelime Kaydırma",
    "settings.autoRun": "Değişimde otomatik çalıştır",
    "share.title": "Kod Paylaş",
    "share.info": "Kodun URL'ye kodlandı — herkesle paylaşabilirsin!",
    "dart.compiling": "Dart derleniyor…",
    "toast.copied": "Panoya kopyalandı!",
    "toast.shared": "Paylaşım linki kopyalandı!",
    "toast.cleared": "Editör temizlendi",
    "toast.formatted": "Kod formatlandı",
    "run.success": "Başarıyla çalıştırıldı",
    "run.error": "Çalışma zamanı hatası",
    "console.clear": "Konsol temizlendi",
  }
};

class I18n {
  constructor() {
    this.locale = localStorage.getItem('velox-locale') || 'en';
  }

  t(key) {
    return (VeloxI18n[this.locale] || VeloxI18n.en)[key] || key;
  }

  setLocale(locale) {
    if (!VeloxI18n[locale]) return;
    this.locale = locale;
    localStorage.setItem('velox-locale', locale);
    this.applyAll();
  }

  applyAll() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (el.tagName === 'INPUT') {
        el.placeholder = this.t(key);
      } else {
        el.textContent = this.t(key);
      }
    });
  }
}

window.i18n = new I18n();
