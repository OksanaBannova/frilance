/* Public project credentials; secret/service-role keys must never go here. */
window.FRILANCE_CONFIG = Object.freeze({
  supabaseUrl: "https://vmiehkctmtpmpmizhkzt.supabase.co",
  supabaseKey: "sb_publishable_XeGc3k4Wl67a0MSXzSufYA_L0Zl-sRS",
  imageBucket: "portfolio-images",
  maxImageSize: 10 * 1024 * 1024,
  imageTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
});

window.frilanceSupabase = window.supabase
  ? window.supabase.createClient(
      window.FRILANCE_CONFIG.supabaseUrl,
      window.FRILANCE_CONFIG.supabaseKey,
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
    )
  : null;

window.frilanceImageType = function (file) {
  const extensions = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };
  return file.type || extensions[file.name.split(".").pop().toLowerCase()] || "";
};

window.frilanceNotifySiteChanged = function () {
  try { localStorage.setItem("frilance-content-updated", String(Date.now())); } catch (_) { /* Storage can be disabled. */ }
};
