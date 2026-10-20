import { supabase } from "../assets/js/core/supabase.js";

// Install synchronously at module import so privileged controls never flash before role lookup.
const STYLE_ID = "finova-master-access-initial-guard";
if (typeof document !== "undefined") document.body?.removeAttribute("data-finova-master-manager");
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body:not([data-finova-master-manager="true"]) #bp-btn-add,
    body:not([data-finova-master-manager="true"]) #btn-add-account,
    body:not([data-finova-master-manager="true"]) #btn-add-tax,
    body:not([data-finova-master-manager="true"]) #btn-add-accounting-period,
    body:not([data-finova-master-manager="true"]) #btn-add-user,
    body:not([data-finova-master-manager="true"]) [id*="btn-add-business-partner"],
    body:not([data-finova-master-manager="true"]) [id*="btn-add-tax"],
    body:not([data-finova-master-manager="true"]) [id*="btn-add-user"] { display:none !important; visibility:hidden !important; opacity:0 !important; }
    body:not([data-finova-master-manager="true"]) .finova-table-action button:not(.finova-staff-view-only),
    body:not([data-finova-master-manager="true"]) .finova-table-action a,
    body:not([data-finova-master-manager="true"]) .bp-action-group button:not(.finova-staff-view-only),
    body:not([data-finova-master-manager="true"]) .tax-action-group button:not(.finova-staff-view-only),
    body:not([data-finova-master-manager="true"]) td:last-child [data-action]:not([data-action="view"]),
    body:not([data-finova-master-manager="true"]) td:last-child [data-tax-action],
    body:not([data-finova-master-manager="true"]) td:last-child [data-period-action],
    body:not([data-finova-master-manager="true"]) td:last-child .user-action-btn:not(.user-action-view),
    body:not([data-finova-master-manager="true"]) td:last-child button[title="Edit"],
    body:not([data-finova-master-manager="true"]) td:last-child button[title="Delete"],
    body:not([data-finova-master-manager="true"]) td:last-child button[title*="Status"],
    body:not([data-finova-master-manager="true"]) td:last-child button[title*="Reset"] { display:none !important; visibility:hidden !important; }
    .finova-staff-view-only { display:inline-flex !important; visibility:visible !important; opacity:1 !important; }
  `;
  (document.head || document.documentElement).appendChild(style);
}

// When Staff opens a native edit modal through the eye action, keep its familiar
// layout but disable every control and hide all submit/save/update actions.
if (typeof document !== "undefined" && !window.__FINOVA_STAFF_VIEW_MODAL_GUARD__) {
  window.__FINOVA_STAFF_VIEW_MODAL_GUARD__ = true;
  document.addEventListener("show.bs.modal", event => {
    if (!window.__FINOVA_STAFF_VIEW_ONLY_PENDING__) return;
    const modal = event.target;
    if (!(modal instanceof HTMLElement) || !modal.classList.contains("modal")) return;
    modal.dataset.finovaStaffReadOnly = "true";
    const lockModal = () => {
      // A read-only modal must not submit through Enter, keyboard shortcuts, or a
      // submit handler that was registered before the modal was made read-only.
      modal.querySelectorAll("form").forEach(form => {
        if (form.dataset.finovaReadOnlySubmitGuard === "true") return;
        form.dataset.finovaReadOnlySubmitGuard = "true";
        form.addEventListener("submit", submitEvent => {
          if (modal.dataset.finovaStaffReadOnly === "true") {
            submitEvent.preventDefault();
            submitEvent.stopImmediatePropagation();
          }
        }, true);
      });
      modal.querySelectorAll("input, select, textarea, button, [contenteditable='true']").forEach(el => {
        const keepClose = el.matches("[data-bs-dismiss='modal'], .btn-close, [aria-label='Close']");
        if (keepClose) return;
        if (el.matches("input, select, textarea, [contenteditable='true']")) {
          if (el.tagName === "SELECT" || el.type === "checkbox" || el.type === "radio") el.disabled = true;
          else { el.readOnly = true; el.setAttribute("readonly", "readonly"); }
          el.setAttribute("aria-readonly", "true");
        } else if (el.matches("button")) {
          const label = `${el.textContent || ""} ${el.title || ""} ${el.getAttribute("aria-label") || ""}`.toLowerCase();
          if (/save|update|submit|simpan|ubah|add|tambah|delete|hapus/.test(label) || el.type === "submit") {
            el.hidden = true; el.style.setProperty("display", "none", "important");
          }
        }
      });
      modal.querySelectorAll(".select2, .choices, .dropdown-toggle").forEach(el => {
        el.style.pointerEvents = "none";
        el.setAttribute("aria-disabled", "true");
      });
      const title = modal.querySelector(".modal-title, [id$='ModalLabel'], [id$='modalLabel']");
      if (title && !/view|detail|detail/i.test(title.textContent || "")) title.textContent = `View ${title.textContent.replace(/^Edit\s+/i, "").replace(/^Add\s+/i, "")}`;
      window.__FINOVA_STAFF_VIEW_ONLY_PENDING__ = false;
    };
    // Apply immediately during the Bootstrap show event, then again after the form paints.
    lockModal();
    modal.addEventListener("shown.bs.modal", lockModal, { once: true });
  }, true);
}

const escapeHtml = (value) => String(value ?? "-").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

function ensureViewButton(cell, moduleName) {
  if (!cell || cell.querySelector(":scope > .finova-staff-view-only, .finova-staff-view-only")) return;
  const row = cell.closest("tr");
  if (!row) return;
  if (/user\s*management/i.test(moduleName)) {
    const nativeView = row.querySelector('button[data-action="view"], .user-action-view');
    if (nativeView) {
      nativeView.classList.add("finova-staff-view-only");
      nativeView.style.setProperty("display", "inline-flex", "important");
      nativeView.style.setProperty("align-items", "center");
      nativeView.style.setProperty("justify-content", "center");
      nativeView.style.setProperty("box-sizing", "border-box");
      nativeView.style.setProperty("width", "32px");
      nativeView.style.setProperty("height", "32px");
      nativeView.style.setProperty("min-width", "32px");
      nativeView.style.setProperty("padding", "0");
      nativeView.style.setProperty("font-size", "13px");
      nativeView.style.setProperty("line-height", "1");
      // Match the blue View action used by BP, COA, and Tax Master.
      nativeView.style.setProperty("color", "#2563eb", "important");
      nativeView.style.setProperty("background", "#eff6ff", "important");
      nativeView.style.setProperty("border", "1px solid #bfdbfe", "important");
      nativeView.style.setProperty("border-radius", "5px", "important");
      nativeView.style.setProperty("cursor", "pointer", "important");
      nativeView.querySelectorAll("i, svg").forEach(icon => {
        icon.style.setProperty("color", "#2563eb", "important");
        icon.style.setProperty("fill", "#2563eb", "important");
      });
      return;
    }
  }
  const table = row.closest("table");
  const headers = [...(table?.querySelectorAll("thead th") || [])];
  const cells = [...row.querySelectorAll("td")];
  const fields = cells.slice(0, -1).map((td, i) => ({
    label: headers[i]?.textContent?.trim() || `Field ${i + 1}`,
    value: td.innerText?.trim() || "-"
  })).filter(x => x.value && x.label.toLowerCase() !== "no");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "finova-staff-view-only";
  button.title = "View";
  button.setAttribute("aria-label", `View ${moduleName}`);
  button.style.cssText = "display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;color:#2563eb;background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;width:32px;height:32px;min-width:32px;padding:0;font-size:13px;line-height:1;cursor:pointer;";
  button.innerHTML = '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
  button.addEventListener("click", () => {
    // Reuse the module's existing edit modal, but force it into read-only mode.
    const editButton = row.querySelector(
      ".btn-action-edit, [data-action='edit'], .coa-action-edit, .tax-action-edit, [data-tax-action='edit'], [title='Edit']"
    );
    if (!editButton) {
      console.warn(`[${moduleName}] Cannot open native detail modal: edit trigger not found.`);
      return;
    }
    window.__FINOVA_STAFF_VIEW_ONLY_PENDING__ = true;
    editButton.click();
  });
  cell.appendChild(button);
}

function installViewOnly(moduleName) {
  const scan = () => {
    document.querySelectorAll("table tbody tr").forEach(row => {
      const cells = [...row.querySelectorAll("td")];
      if (!cells.length) return;
      const actionCell = cells.find(td => td.matches(".finova-table-action") || td.querySelector(".bp-action-group,.tax-action-group,[data-action],[data-tax-action]"))
        || (cells[cells.length - 1].querySelector("button,a") ? cells[cells.length - 1] : null);
      if (actionCell) ensureViewButton(actionCell, moduleName);
    });
  };
  scan();
  if (document.body && !document.body.dataset.finovaMasterViewObserver) {
    document.body.dataset.finovaMasterViewObserver = "true";
    const observer = new MutationObserver(() => {
      // Observe DOM changes so dynamically rendered/paginated rows get their View control.
      document.querySelectorAll("table tbody tr").forEach(row => {
        const cells = [...row.querySelectorAll("td")];
        if (!cells.length) return;
        const cell = cells.find(td => td.matches(".finova-table-action") || td.querySelector(".bp-action-group,.tax-action-group,[data-action],[data-tax-action]"))
          || (cells[cells.length - 1].querySelector("button,a") ? cells[cells.length - 1] : null);
        if (cell) ensureViewButton(cell, document.body.dataset.finovaMasterModule || moduleName);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  document.body?.setAttribute("data-finova-master-module", moduleName);
}

export async function applyMasterViewOnlyForStaff(moduleName, addButtonIds = []) {
  const hide = el => { if (el) { el.hidden = true; el.style.setProperty("display", "none", "important"); el.setAttribute("aria-hidden", "true"); } };
  const show = el => { if (el) { el.hidden = false; el.style.removeProperty("display"); el.removeAttribute("aria-hidden"); } };
  let isManager = false;
  try {
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (auth?.user?.id) {
      const { data: effectiveCompanyId, error: companyContextError } =
        await supabase.rpc("finova_effective_company_id");
      if (companyContextError) throw companyContextError;

      const companyId = String(effectiveCompanyId ?? "").trim();
      if (!companyId) throw new Error("Active company context was not found.");

      const { data: profile, error } = await supabase.from("mst_users")
        .select("role,status,company_id")
        .eq("user_uid", auth.user.id)
        .eq("company_id", companyId)
        .maybeSingle();
      if (error) throw error;
      const normalizedRole = String(profile?.role ?? "").trim().replace(/\s+/g, " ").toLowerCase();
      isManager = profile?.status === true
        && ["manager", "super admin"].includes(normalizedRole);
    }
  } catch (e) {
    console.error(`[${moduleName}] role check failed; master actions remain hidden`, e);
  }
  if (isManager) {
    document.body?.setAttribute("data-finova-master-manager", "true");
    addButtonIds.forEach(id => show(document.getElementById(id)));
    return true;
  }
  document.body?.removeAttribute("data-finova-master-manager");
  addButtonIds.forEach(id => hide(document.getElementById(id)));
  installViewOnly(moduleName);
  return false;
}
