async function loadContent() {
  const response = await fetch("./content.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to load content.json");
  return response.json();
}

function text(id, value) {
  const el = document.getElementById(id);
  if (el && typeof value === "string") el.textContent = value;
}

function createMeta(items) {
  return items.filter(Boolean).map((item) => `<span>${item}</span>`).join("");
}

function techText(value) {
  return Array.isArray(value) ? value.join(" / ") : "";
}

function renderHome(data) {
  text("site-name", data.site.name);
  text("home-tag", data.site.tagline);
  text("home-title", data.home.title);
  text("home-summary", data.home.summary);
  text("contact-email", data.site.email);

  const overview = document.getElementById("home-overview");
  if (!overview) return;
  overview.innerHTML = "";
  data.home.overview.forEach((item) => {
    const article = document.createElement("article");
    article.innerHTML = `<h2>${item.title}</h2><p>${item.text}</p>`;
    overview.appendChild(article);
  });
}

function renderProjects(data) {
  text("site-name", data.site.name);
  text("projects-title", data.projects.title);
  text("projects-summary", data.projects.summary);

  const cards = document.getElementById("project-cards");
  if (!cards) return;
  cards.innerHTML = "";
  data.projects.items.forEach((item) => {
    const article = document.createElement("article");
    article.innerHTML = `<h2>${item.title}</h2><p>${item.role}</p><p>${item.result}</p>`;
    cards.appendChild(article);
  });
}

function renderInsights(data) {
  text("site-name", data.site.name);
  text("insights-title", data.insights.title);
  text("insights-summary", data.insights.summary);

  const cards = document.getElementById("insight-list");
  if (!cards) return;
  cards.innerHTML = "";
  data.insights.items.forEach((item) => {
    const stack = Array.isArray(item.techStack) ? item.techStack.slice(0, 3).join(" / ") : "";
    const article = document.createElement("article");
    article.className = "insight-card";
    article.innerHTML = `
      <a href="./insight.html?id=${encodeURIComponent(item.id)}">
        <h2>${item.title}</h2>
        <p>${item.summary || ""}</p>
        <div class="insight-meta">
          ${createMeta([item.projectName || "未命名项目", item.status, stack, item.dateText])}
        </div>
      </a>
    `;
    cards.appendChild(article);
  });
}

function snapshotFromCurrent(item) {
  return {
    title: item.title,
    date: item.date,
    dateText: item.dateText,
    summary: item.summary,
    content: item.content || [],
    status: item.status || "",
    techStack: item.techStack || [],
    sourcePath: item.sourcePath || "",
  };
}

function getSnapshots(item) {
  const current = snapshotFromCurrent(item);
  const history = Array.isArray(item.history) ? item.history : [];
  return [current, ...history].filter((entry) => entry && (entry.date || entry.dateText));
}

function renderSnapshot(item, snapshot) {
  text("insight-detail-title", snapshot.title || item.title);
  text("insight-detail-summary", snapshot.summary || "");
  text("insight-detail-project", item.projectName || "未命名项目");
  text("insight-detail-date", snapshot.dateText || snapshot.date || "");
  text("insight-detail-status", snapshot.status || item.status || "");
  text("insight-detail-tech", techText(snapshot.techStack || item.techStack));
  text("insight-detail-source", snapshot.sourcePath || item.sourcePath || "");

  const container = document.getElementById("insight-detail-content");
  if (!container) return;
  container.innerHTML = "";
  (snapshot.content || []).forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    container.appendChild(p);
  });
}

function renderTimeline(item, snapshots) {
  const slider = document.getElementById("insight-time-slider");
  const list = document.getElementById("insight-timeline");
  if (!slider || !list) return;

  slider.max = String(Math.max(snapshots.length - 1, 0));
  slider.value = "0";
  slider.disabled = snapshots.length <= 1;
  list.innerHTML = "";

  function selectSnapshot(index) {
    const selected = snapshots[index] || snapshots[0];
    slider.value = String(index);
    list.querySelectorAll("button").forEach((button, buttonIndex) => {
      button.classList.toggle("current", buttonIndex === index);
    });
    renderSnapshot(item, selected);
  }

  snapshots.forEach((snapshot, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<span>${snapshot.dateText || snapshot.date}</span><small>${index === 0 ? "Current" : snapshot.status || "History"}</small>`;
    button.addEventListener("click", () => selectSnapshot(index));
    list.appendChild(button);
  });

  slider.addEventListener("input", () => selectSnapshot(Number(slider.value)));
  selectSnapshot(0);
}

function renderInsightDetail(data) {
  text("site-name", data.site.name);
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const item = data.insights.items.find((entry) => entry.id === id);
  if (!item) {
    text("insight-detail-title", "未找到该洞察");
    text("insight-detail-summary", "请返回洞察页重新选择卡片。");
    return;
  }

  const snapshots = getSnapshots(item);
  renderTimeline(item, snapshots);
}

async function main() {
  try {
    const data = await loadContent();
    const page = document.body.dataset.page;
    if (page === "home") renderHome(data);
    if (page === "projects") renderProjects(data);
    if (page === "insights") renderInsights(data);
    if (page === "insight-detail") renderInsightDetail(data);
  } catch (error) {
    console.error(error);
  }
}

main();
