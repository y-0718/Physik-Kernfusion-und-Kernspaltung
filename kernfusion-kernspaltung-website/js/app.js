const fallbackPages = [
  {
    title: "Kernfusion",
    summary: "Leichte Atomkerne verschmelzen zu schwereren Kernen. Dabei kann sehr viel Energie frei werden.",
    body: "In der Sonne verschmelzen Wasserstoffkerne zu Helium. Damit die Kerne ihre elektrische Abstossung ueberwinden, braucht es extrem hohe Temperaturen und hohen Druck."
  },
  {
    title: "Kernspaltung",
    summary: "Schwere Atomkerne zerfallen in kleinere Bruchstuecke und setzen Energie sowie Neutronen frei.",
    body: "Bei Uran-235 kann ein Neutron eine Spaltung ausloesen. Neue Neutronen koennen weitere Spaltungen starten, wodurch eine Kettenreaktion entsteht."
  },
  {
    title: "Massendefekt",
    summary: "Ein Teil der Masse wird nach E = mc² in Energie umgewandelt.",
    body: "Die Produkte einer Kernreaktion haben oft eine etwas geringere Masse als die Ausgangsteilchen. Diese Differenz erscheint als Energie."
  }
];

const pagesContainer = document.querySelector("#pages");
const xField = document.querySelector(".x-field");

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function youtubeEmbed(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video/${parsed.pathname.split("/").filter(Boolean).pop()}`;
    }
  } catch (_error) {
    return "";
  }
  return "";
}

function mediaMarkup(page) {
  if (page.video_url) {
    const embed = youtubeEmbed(page.video_url);
    if (embed) {
      return `<iframe src="${escapeHtml(embed)}" title="${escapeHtml(page.title)} Video" allowfullscreen loading="lazy"></iframe>`;
    }
    return `<video src="${escapeHtml(page.video_url)}" controls></video>`;
  }

  if (page.image_url) {
    return `<img src="${escapeHtml(page.image_url)}" alt="${escapeHtml(page.title)}" loading="lazy">`;
  }

  return "";
}

function renderPages(pages) {
  pagesContainer.innerHTML = pages.map((page) => `
    <article class="page-card">
      <div class="page-card-media">${mediaMarkup(page)}</div>
      <div class="page-card-body">
        <p class="mini-label">${escapeHtml(page.slug || "Thema")}</p>
        <h3>${escapeHtml(page.title)}</h3>
        <p>${escapeHtml(page.summary || "")}</p>
        <p class="page-text">${escapeHtml(page.body || "")}</p>
      </div>
    </article>
  `).join("");
}

async function loadPages() {
  try {
    const response = await fetch("/api/pages");
    if (!response.ok) throw new Error("Pages could not be loaded.");
    const pages = await response.json();
    renderPages(pages.length ? pages : fallbackPages);
  } catch (_error) {
    renderPages(fallbackPages);
  }
}

function createParticles() {
  const count = window.matchMedia("(max-width: 720px)").matches ? 14 : 28;
  xField.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    particle.className = `x-particle${index % 5 === 0 ? " dark" : ""}`;
    particle.dataset.depth = String(0.25 + Math.random() * 1.2);
    particle.style.setProperty("--x", `${Math.random() * 100}vw`);
    particle.style.setProperty("--y", `${Math.random() * 100}vh`);
    particle.style.setProperty("--r", `${Math.random() * 180}deg`);
    particle.style.setProperty("--blur", "0px");
    xField.appendChild(particle);
  }
}

function animateParticles() {
  const progress = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1);
  document.querySelectorAll(".x-particle").forEach((particle, index) => {
    const depth = Number(particle.dataset.depth);
    const drift = progress * 180 * depth;
    const blur = Math.min(9, progress * 12 * depth);
    const opacity = Math.min(0.38, 0.12 + progress * 0.44);
    particle.style.transform = `translate3d(calc(var(--x) + ${Math.sin(index) * drift}px), calc(var(--y) + ${drift}px), 0) rotate(calc(var(--r) + ${progress * 220}deg))`;
    particle.style.filter = `blur(${blur}px)`;
    particle.style.opacity = opacity;
  });
}

createParticles();
loadPages();
animateParticles();

window.addEventListener("scroll", animateParticles, { passive: true });
window.addEventListener("resize", () => {
  createParticles();
  animateParticles();
});
