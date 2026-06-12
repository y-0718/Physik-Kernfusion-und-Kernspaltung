const loginPanel = document.querySelector("#loginPanel");
const workspacePanel = document.querySelector("#workspacePanel");
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");
const pageForm = document.querySelector("#pageForm");
const pageList = document.querySelector("#pageList");
const formMessage = document.querySelector("#formMessage");
const newButton = document.querySelector("#newButton");
const deleteButton = document.querySelector("#deleteButton");
const logoutButton = document.querySelector("#logoutButton");

let pages = [];
let selectedId = "";

function field(id) {
  return document.querySelector(`#${id}`);
}

function setMessage(target, text, isError = false) {
  target.textContent = text;
  target.style.color = isError ? "#090909" : "#0b43d9";
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function formData() {
  return {
    id: field("pageId").value,
    title: field("title").value,
    slug: field("slug").value || slugify(field("title").value),
    summary: field("summary").value,
    body: field("body").value,
    image_url: field("imageUrl").value,
    video_url: field("videoUrl").value,
    sort_order: Number(field("sortOrder").value || 0),
    is_published: field("isPublished").checked
  };
}

function fillForm(page = {}) {
  selectedId = page.id || "";
  field("pageId").value = page.id || "";
  field("title").value = page.title || "";
  field("slug").value = page.slug || "";
  field("summary").value = page.summary || "";
  field("body").value = page.body || "";
  field("imageUrl").value = page.image_url || "";
  field("videoUrl").value = page.video_url || "";
  field("sortOrder").value = page.sort_order || 0;
  field("isPublished").checked = page.is_published !== false;
  deleteButton.disabled = !selectedId;
  renderList();
}

function renderList() {
  pageList.innerHTML = pages.map((page) => `
    <button class="list-item${page.id === selectedId ? " active" : ""}" data-id="${page.id}" type="button">
      <strong>${page.title}</strong><br>
      <small>${page.is_published ? "veröffentlicht" : "Entwurf"} · Reihenfolge ${page.sort_order}</small>
    </button>
  `).join("");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Aktion fehlgeschlagen.");
  return data;
}

async function loadPages() {
  pages = await api("/api/pages?admin=true");
  renderList();
  if (pages[0] && !selectedId) fillForm(pages[0]);
}

async function showWorkspace() {
  loginPanel.classList.add("hidden");
  workspacePanel.classList.remove("hidden");
  await loadPages();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(loginMessage, "Prüfe Passwort...");
  try {
    await api("/api/admin-login", {
      method: "POST",
      body: JSON.stringify({ password: field("password").value })
    });
    setMessage(loginMessage, "");
    await showWorkspace();
  } catch (error) {
    setMessage(loginMessage, error.message, true);
  }
});

pageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const page = formData();
  setMessage(formMessage, "Speichere...");
  try {
    const saved = await api("/api/pages", {
      method: page.id ? "PUT" : "POST",
      body: JSON.stringify(page)
    });
    setMessage(formMessage, "Gespeichert.");
    selectedId = saved.id;
    await loadPages();
    fillForm(pages.find((item) => item.id === saved.id) || saved);
  } catch (error) {
    setMessage(formMessage, error.message, true);
  }
});

pageList.addEventListener("click", (event) => {
  const button = event.target.closest(".list-item");
  if (!button) return;
  const page = pages.find((item) => item.id === button.dataset.id);
  if (page) fillForm(page);
});

newButton.addEventListener("click", () => {
  fillForm({ sort_order: pages.length + 1, is_published: true });
  setMessage(formMessage, "");
});

deleteButton.addEventListener("click", async () => {
  if (!selectedId) return;
  const page = pages.find((item) => item.id === selectedId);
  const confirmed = window.confirm(`Seite "${page?.title || "ohne Titel"}" wirklich löschen?`);
  if (!confirmed) return;

  try {
    await api(`/api/pages?id=${encodeURIComponent(selectedId)}`, { method: "DELETE" });
    selectedId = "";
    fillForm({});
    await loadPages();
    setMessage(formMessage, "Gelöscht.");
  } catch (error) {
    setMessage(formMessage, error.message, true);
  }
});

logoutButton.addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" });
  window.location.reload();
});

field("title").addEventListener("input", () => {
  if (!field("pageId").value) field("slug").value = slugify(field("title").value);
});

loadPages().then(showWorkspace).catch(() => {
  loginPanel.classList.remove("hidden");
  workspacePanel.classList.add("hidden");
});
