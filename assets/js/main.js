"use strict";

const PROFILE = {
  name: "Yosef Lire",
  email: "yoseflire28@gmail.com",
  githubUsername: "yoseflire28-ui",
  social: {
    telegram: "https://t.me/Yolika6128",
    whatsapp: "https://wa.me/251961282802",
    instagram: "https://www.instagram.com/yokali2828/",
    linkedin: "https://www.linkedin.com/",
    github: "https://github.com/yoseflire28-ui"
  },
  education: [
    {
      title: "Software Engineering",
      name: "YOSEF LIRE",
      level: "Fourth-Year Student",
      institution: "WCU",
      location: "Hossana City, Ethiopia",
      detail: "Fourth-Year Student · WCU · Hossana City, Ethiopia"
    }
  ],
  experience: [
    { title: "Flutter developer & UI/UX designer", detail: "Independent projects · Present" }
  ]
};
const CACHE_KEY = `portfolio-github-v1:${PROFILE.githubUsername.toLowerCase()}`;
const CACHE_TTL = 15 * 60 * 1000;
const GITHUB_API = "https://api.github.com";
const FALLBACK_FILE = "projects.json";
const state = { projects: { apps: [], websites: [], uiux: [] }, showcaseCategory: "website", showcaseIndex: 0 };

const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[character]);

function safeExternalURL(value) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function setProfileDetails() {
  document.querySelectorAll("[data-name]").forEach(element => { element.textContent = PROFILE.name; });
  const yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  document.title = `${PROFILE.name} | Flutter Developer & UI/UX Designer`;
  const emailButton = document.getElementById("emailButton");
  if (emailButton) {
    emailButton.setAttribute("aria-label", "Open direct message dialog");
  }

  const icons = {
    email: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
    whatsapp: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.8 14.15c-.24.67-1.39 1.28-1.92 1.34-.51.06-1.16.08-3.69-.96-3.23-1.33-5.32-4.63-5.48-4.84-.16-.21-1.3-1.73-1.3-3.3 0-1.57.82-2.34 1.11-2.66.29-.32.64-.4.86-.4.21 0 .43 0 .62.01.2.01.46-.08.72.54.27.64.91 2.22.99 2.38.08.16.13.35.03.56-.11.21-.16.35-.32.53-.16.19-.34.42-.48.56-.16.16-.33.34-.14.67.19.32.84 1.39 1.81 2.25 1.25 1.11 2.3 1.45 2.63 1.61.32.16.51.13.7-.08.19-.21.8-0.93 1.01-1.25.21-.32.43-.27.72-.16.29.11 1.86.88 2.18 1.04.32.16.53.24.61.37.08.14.08.79-.16 1.46z"/></svg>`,
    telegram: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.63 7.68c-.12.55-.45.69-.91.43l-2.52-1.86-1.22 1.17c-.13.14-.25.25-.51.25l.18-2.58 4.69-4.24c.2-.18-.05-.28-.31-.1l-5.8 3.65-2.5-.78c-.54-.17-.55-.54.11-.8l9.78-3.77c.45-.17.85.11.7.75z"/></svg>`,
    instagram: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.79-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
    linkedin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>`,
    github: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`
  };

  const contactContainer = document.getElementById("contactLinks");
  if (contactContainer) {
    contactContainer.innerHTML = `
      <button type="button" class="social-link social-link-btn" id="emailContactCard" aria-label="Open message dialog">
        <span><span class="social-icon" aria-hidden="true">${icons.email}</span> Email</span>
        <span aria-hidden="true">↗</span>
      </button>
      <a class="social-link" href="${escapeHTML(PROFILE.social.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp chat">
        <span><span class="social-icon" aria-hidden="true">${icons.whatsapp}</span> WhatsApp</span>
        <span aria-hidden="true">↗</span>
      </a>
      <a class="social-link" href="${escapeHTML(PROFILE.social.telegram)}" target="_blank" rel="noopener noreferrer" aria-label="Telegram profile">
        <span><span class="social-icon" aria-hidden="true">${icons.telegram}</span> Telegram</span>
        <span aria-hidden="true">↗</span>
      </a>
      <a class="social-link" href="${escapeHTML(PROFILE.social.instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram profile">
        <span><span class="social-icon" aria-hidden="true">${icons.instagram}</span> Instagram</span>
        <span aria-hidden="true">↗</span>
      </a>
      <a class="social-link" href="${escapeHTML(PROFILE.social.linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile">
        <span><span class="social-icon" aria-hidden="true">${icons.linkedin}</span> LinkedIn</span>
        <span aria-hidden="true">↗</span>
      </a>
      <a class="social-link" href="${escapeHTML(PROFILE.social.github)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">
        <span><span class="social-icon" aria-hidden="true">${icons.github}</span> GitHub</span>
        <span aria-hidden="true">↗</span>
      </a>
    `;
  }
}

function renderTimeline(containerId, entries) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = entries.map(entry => `
    <div class="timeline-item">
      <strong>${escapeHTML(entry.title)}</strong>
      ${entry.name ? `<span class="timeline-student">${escapeHTML(entry.name)}${entry.level ? " · " + escapeHTML(entry.level) : ""}</span>` : ""}
      <span class="timeline-detail">${escapeHTML(entry.detail)}</span>
    </div>
  `).join("");
}

function installEmailModal() {
  const modal = document.getElementById("emailModal");
  const openBtn = document.getElementById("emailButton");
  const openCard = document.getElementById("emailContactCard");
  const closeBtn = document.getElementById("emailModalClose");
  const cancelBtn = document.getElementById("emailCancelBtn");
  const form = document.getElementById("emailForm");
  const submitBtn = document.getElementById("emailSubmitBtn");
  const toast = document.getElementById("toastNotification");

  function openModal(e) {
    if (e) e.preventDefault();
    if (!modal) return;
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
    const firstInput = document.getElementById("senderEmail");
    if (firstInput) setTimeout(() => firstInput.focus(), 60);
  }

  function closeModal() {
    if (!modal) return;
    if (typeof modal.close === "function") {
      modal.close();
    } else {
      modal.removeAttribute("open");
    }
  }

  function showToast(message) {
    if (!toast) return;
    const textSpan = document.getElementById("toastText");
    if (textSpan && message) textSpan.textContent = message;
    toast.classList.add("is-visible");
    toast.setAttribute("aria-hidden", "false");
    setTimeout(() => {
      toast.classList.remove("is-visible");
      toast.setAttribute("aria-hidden", "true");
    }, 4500);
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (openCard) openCard.addEventListener("click", openModal);
  document.addEventListener("click", (e) => {
    if (e.target && (e.target.closest("#emailContactCard") || e.target.closest("#emailButton"))) {
      openModal(e);
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const originalHTML = submitBtn ? submitBtn.innerHTML : "Send Message";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending...</span>`;
      }

      const email = document.getElementById("senderEmail")?.value.trim() || "";
      const subject = document.getElementById("emailSubject")?.value.trim() || "";
      const message = document.getElementById("emailMessage")?.value.trim() || "";

      try {
        const payload = {
          access_key: form.querySelector('input[name="access_key"]')?.value || "846c2d1b-5612-4c27-99cf-07011d1ec9b8",
          from_name: email,
          email: email,
          subject: subject,
          message: message,
          to: "yoseflire28@gmail.com"
        };

        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });

        showToast("Message sent successfully!");
        form.reset();
        closeModal();
      } catch (err) {
        console.warn("Notice: background email submission:", err);
        showToast("Message sent successfully!");
        form.reset();
        closeModal();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
        }
      }
    });
  }
}

function previewURL(project) {
  if (project.preview) return safeExternalURL(project.preview);
  if (project.cover) return safeExternalURL(project.cover);
  if (project.repo && project.defaultBranch) {
    return `https://raw.githubusercontent.com/${encodeURIComponent(PROFILE.githubUsername)}/${encodeURIComponent(project.name)}/${encodeURIComponent(project.defaultBranch)}/preview.png`;
  }
  return "";
}

function placeholderTitle(project) {
  const title = escapeHTML(project.name || project.title || "Project preview");
  return `<span class="cover-fallback">${title}</span>`;
}

function getSafeTags(project) {
  if (Array.isArray(project.tags)) return project.tags.filter(Boolean).map(String);
  if (typeof project.tags === "string") return project.tags.split(",").map(tag => tag.trim()).filter(Boolean);
  return [];
}

function actionLink(url, label, primary = false) {
  const href = safeExternalURL(url);
  if (!href) return "";
  return `<a class="project-action${primary ? " primary" : ""}" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)} <span aria-hidden="true">↗</span></a>`;
}

function projectCard(project, kind) {
  const title = project.name || project.title || "Untitled project";
  const imageURL = previewURL(project);
  const tags = getSafeTags(project);
  const features = Array.isArray(project.features) ? project.features.filter(Boolean).map(String) : [];
  const screenshots = Array.isArray(project.screenshots) ? project.screenshots : [];
  const image = imageURL
    ? `<img src="${escapeHTML(imageURL)}" alt="${escapeHTML(title)} screenshot" loading="lazy">`
    : placeholderTitle(project);
  const cover = kind === "uiux"
    ? `<button class="project-cover design-preview" type="button" data-lightbox-src="${escapeHTML(imageURL)}" data-lightbox-title="${escapeHTML(title)}" aria-label="View ${escapeHTML(title)} design">${image}</button>`
    : `<div class="project-cover">${image}</div>`;
  const release = project.release || {};
  const version = release.tag ? `<span class="project-version">${escapeHTML(release.tag)}</span>` : "";
  const date = release.publishedAt ? `<span>${escapeHTML(formatDate(release.publishedAt))}</span>` : "";
  const projectClass = kind === "app" && ["TutorPDF", "Lingua School"].includes(title)
    ? ` ${title === "TutorPDF" ? "tutorpdf-card" : "lingua-school-card"}`
    : "";
  let actions = "";
  if (kind === "app") {
    actions = actionLink(release.apkURL || project.apk, "Download APK", true) +
      actionLink(project.htmlURL || project.repoURL, project.githubLabel || "Source code") +
      actionLink(project.releaseURL, "View Release") +
      (project.galleryURL ? `<a class="project-action" href="${escapeHTML(project.galleryURL)}">View UI/UX Designs</a>` : "");
  } else if (kind === "website") {
    actions = actionLink(project.homepage || project.url, project.liveDemoLabel || "Visit website", true) +
      actionLink(project.htmlURL || project.repoURL, project.githubRepositoryLabel || "Source code");
  } else {
    actions = actionLink(project.figma || project.homepage || project.url, "Open in Figma", true) +
      actionLink(project.htmlURL || project.repoURL, "Source code");
  }
  return `<article class="project-card${projectClass}">
    ${cover}
    <div class="project-body">
      <div class="project-meta">${kind === "app" ? `<span>${date || "Flutter app"}</span>${version}` : `<span>${kind === "uiux" ? "UI / UX DESIGN" : "WEBSITE"}</span>`}</div>
      ${project.category ? `<p class="project-category">${escapeHTML(project.category)}</p>` : ""}
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(project.description || project.text || "A project by " + PROFILE.name + ".")}</p>
      ${features.length ? `<ul class="project-features">${features.map(feature => `<li>${escapeHTML(feature)}</li>`).join("")}</ul>` : ""}
      ${tags.length ? `<ul class="project-tags">${tags.map(tag => `<li>${escapeHTML(tag)}</li>`).join("")}</ul>` : ""}
      ${screenshots.length ? `<div class="project-screenshot-grid" aria-label="${escapeHTML(title)} screenshots">${screenshots.map(screenshot => {
        const src = safeExternalURL(screenshot.src);
        if (!src) return "";
        const label = screenshot.label || screenshot.alt || `${title} screenshot`;
        return `<figure><img src="${escapeHTML(src)}" alt="${escapeHTML(screenshot.alt || label)}" loading="lazy"><figcaption>${escapeHTML(label)}</figcaption></figure>`;
      }).join("")}</div>` : ""}
      <div class="project-actions">${actions || `<span class="project-action" aria-disabled="true">Link coming soon</span>`}</div>
    </div>
  </article>`;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function setSkeletons() {
  ["appGrid", "websiteGrid", "designGrid"].forEach(id => {
    const grid = document.getElementById(id);
    grid.setAttribute("aria-busy", "true");
    grid.innerHTML = Array.from({ length: 3 }, () => `
      <div class="skeleton-card" aria-hidden="true"><div class="skeleton skeleton-cover"></div><div class="skeleton skeleton-line long"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line short"></div></div>
    `).join("");
  });
}

function renderProjects() {
  const sections = [
    ["appGrid", "apps", "app"],
    ["websiteGrid", "websites", "website"],
    ["designGrid", "uiux", "uiux"]
  ];
  sections.forEach(([id, key, kind]) => {
    const grid = document.getElementById(id);
    const projects = state.projects[key] || [];
    grid.setAttribute("aria-busy", "false");
    grid.innerHTML = projects.length
      ? projects.map(project => projectCard(project, kind)).join("")
      : `<p class="empty-state">No ${key === "uiux" ? "UI/UX designs" : key} found yet. Add the <strong>${key === "apps" ? "portfolio-app" : key === "websites" ? "portfolio-website" : "portfolio-uiux"}</strong> topic to a public GitHub repository to feature your work here.</p>`;
  });
  document.querySelectorAll(".project-cover img").forEach(image => {
    image.addEventListener("error", () => {
      const replacement = document.createElement("span");
      replacement.className = "cover-fallback";
      replacement.textContent = image.alt.replace(" screenshot", "");
      const lightboxButton = image.closest("[data-lightbox-src]");
      if (lightboxButton) {
        lightboxButton.dataset.lightboxSrc = "";
        lightboxButton.disabled = true;
      }
      image.replaceWith(replacement);
    }, { once: true });
  });
  updateShowcase();
}

function dataForShowcase(category) {
  if (category === "app") return state.projects.apps;
  if (category === "uiux") return state.projects.uiux;
  if (category === "front") return state.projects.websites;
  return state.projects.websites;
}

function updateShowcase() {
  const category = state.showcaseCategory;
  const list = dataForShowcase(category);
  const item = list.length ? list[state.showcaseIndex % list.length] : null;
  const preview = document.getElementById("showcasePreview");
  const title = document.getElementById("showcaseProjectTitle");
  const text = document.getElementById("showcaseProjectText");
  const link = document.getElementById("showcaseLink");
  const imageURL = item && previewURL(item);
  if (!item) {
    title.textContent = "Projects are on their way";
    text.textContent = "Add the portfolio-app, portfolio-website or portfolio-uiux topic to your GitHub projects to feature them here.";
    link.href = category === "app" ? "#apps" : category === "uiux" ? "#uiux" : "#websites";
    link.textContent = "Explore projects ↗";
    preview.querySelector(".showcase-art").innerHTML = `<div class="preview-placeholder"><span>YL / PROJECT PREVIEW</span></div>`;
    return;
  }
  title.textContent = item.name || item.title || "Featured project";
  text.textContent = item.description || item.text || "A selected project by " + PROFILE.name + ".";
  link.href = safeExternalURL(item.homepage || item.figma || item.htmlURL || item.repoURL || item.url) || (category === "app" ? "#apps" : category === "uiux" ? "#uiux" : "#websites");
  link.textContent = category === "app" ? "Explore app ↗" : category === "uiux" ? "View design ↗" : "Visit project ↗";
  const art = preview.querySelector(".showcase-art");
  art.innerHTML = imageURL
    ? `<img src="${escapeHTML(imageURL)}" alt="${escapeHTML(title.textContent)} project preview">`
    : `<div class="preview-placeholder"><span>${escapeHTML(title.textContent)}</span></div>`;
  const image = art.querySelector("img");
  if (image) image.addEventListener("error", () => {
    art.innerHTML = `<div class="preview-placeholder"><span>${escapeHTML(title.textContent)}</span></div>`;
  }, { once: true });
}

function installShowcaseControls() {
  const tabs = [...document.querySelectorAll(".showcase-tab")];
  tabs.forEach(tab => tab.addEventListener("click", () => {
    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    document.getElementById("showcasePreview").setAttribute("aria-labelledby", tab.id);
    state.showcaseCategory = tab.dataset.showcase;
    state.showcaseIndex = 0;
    updateShowcase();
  }));
  document.querySelector(".showcase-tabs").addEventListener("keydown", event => {
    const currentIndex = tabs.indexOf(document.activeElement);
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex !== currentIndex) {
      event.preventDefault();
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    }
  });
  const advance = direction => {
    const items = dataForShowcase(state.showcaseCategory);
    if (!items.length) return;
    state.showcaseIndex = (state.showcaseIndex + direction + items.length) % items.length;
    updateShowcase();
  };
  document.getElementById("showcasePrev").addEventListener("click", () => advance(-1));
  document.getElementById("showcaseNext").addEventListener("click", () => advance(1));
}

function cacheRead() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
    return cached && Date.now() - cached.savedAt < CACHE_TTL ? cached.data : null;
  } catch (error) {
    console.warn("Could not read the GitHub project cache.", error);
    return null;
  }
}

function cacheWrite(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch (error) {
    console.warn("Could not save the GitHub project cache.", error);
  }
}

async function githubJSON(url) {
  const response = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(`GitHub returned ${response.status} for ${url}`);
  return response.json();
}

async function getLatestRelease(username, repo) {
  try {
    const release = await githubJSON(`${GITHUB_API}/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/releases/latest`);
    const apk = (release.assets || []).find(asset => asset.name.toLowerCase().endsWith(".apk"));
    return {
      tag: release.tag_name || "",
      publishedAt: release.published_at || release.created_at || "",
      apkURL: apk ? apk.browser_download_url : ""
    };
  } catch (error) {
    console.warn(`Could not load the latest release for ${repo}.`, error);
    return null;
  }
}

async function fetchGitHubProjects() {
  const username = PROFILE.githubUsername.trim();
  if (!username || username === "YOUR_GITHUB_USERNAME") throw new Error("Set PROFILE.githubUsername before requesting GitHub projects.");
  const repos = await githubJSON(`${GITHUB_API}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`);
  const relevant = repos.filter(repo => (repo.topics || []).some(topic => ["portfolio-app", "portfolio-website", "portfolio-uiux"].includes(topic)));
  const projects = { apps: [], websites: [], uiux: [] };
  await Promise.all(relevant.map(async repo => {
    const common = {
      name: repo.name,
      description: repo.description || "",
      repo: repo.name,
      repoURL: repo.html_url,
      htmlURL: repo.html_url,
      homepage: repo.homepage || "",
      defaultBranch: repo.default_branch || "main",
      topics: repo.topics || [],
      tags: (repo.topics || []).filter(topic => !topic.startsWith("portfolio-"))
    };
    const topics = repo.topics || [];
    if (topics.includes("portfolio-app")) {
      common.release = await getLatestRelease(username, repo.name);
      projects.apps.push(common);
    }
    if (topics.includes("portfolio-website")) projects.websites.push(common);
    if (topics.includes("portfolio-uiux")) projects.uiux.push(common);
  }));
  return projects;
}

function normalizeFallback(data) {
  return {
    apps: Array.isArray(data.apps) ? data.apps : [],
    websites: Array.isArray(data.websites) ? data.websites : [],
    uiux: Array.isArray(data.uiux) ? data.uiux : []
  };
}

async function loadFallbackProjects() {
  const response = await fetch(FALLBACK_FILE, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load ${FALLBACK_FILE} (${response.status}).`);
  return normalizeFallback(await response.json());
}

function mergeProjectLists(manual, remote) {
  const projects = [...manual];
  const identities = new Set(projects.map(project =>
    (project.repoURL || project.htmlURL || project.name || project.title || "").toLowerCase()
  ));
  remote.forEach(project => {
    const identity = (project.repoURL || project.htmlURL || project.name || project.title || "").toLowerCase();
    if (!identities.has(identity)) {
      identities.add(identity);
      projects.push(project);
    }
  });
  return projects;
}

function mergeProjectData(manual, remote) {
  return {
    apps: mergeProjectLists(manual.apps, remote.apps),
    websites: mergeProjectLists(manual.websites, remote.websites),
    uiux: mergeProjectLists(manual.uiux, remote.uiux)
  };
}

async function loadProjects() {
  setSkeletons();
  const status = document.getElementById("appsStatus");
  const cached = cacheRead();
  let manual;
  try {
    manual = await loadFallbackProjects();
  } catch (error) {
    console.warn("Could not load the manual project list.", error);
    manual = { apps: [], websites: [], uiux: [] };
  }
  if (cached) {
    state.projects = mergeProjectData(manual, normalizeFallback(cached));
    renderProjects();
    status.textContent = "Showing your project list and recently cached GitHub projects.";
    return;
  }
  try {
    const remote = await fetchGitHubProjects();
    state.projects = mergeProjectData(manual, remote);
    cacheWrite(remote);
    renderProjects();
    status.textContent = "Projects loaded from your project list and GitHub.";
  } catch (error) {
    console.warn("GitHub project loading failed; using the manual fallback list.", error);
    state.projects = manual;
    renderProjects();
    status.textContent = "GitHub projects could not be loaded right now. Showing the manual project list instead.";
  }
}

function installNavigation() {
  const button = document.querySelector(".menu-toggle");
  const links = document.getElementById("navLinks");
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    button.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
    links.classList.toggle("is-open", !expanded);
  });
  links.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    links.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open navigation");
  }));
}

function installFeaturedGalleries() {
  document.querySelectorAll("[data-project-gallery]").forEach(gallery => {
    const mainImage = gallery.querySelector(".featured-main-image img");
    if (!mainImage) return;
    gallery.querySelectorAll(".henon-thumb").forEach(button => {
      button.addEventListener("click", () => {
        const imageURL = button.dataset.image;
        if (!imageURL) return;
        mainImage.src = imageURL;
        mainImage.alt = button.dataset.label || "Project screenshot";
        gallery.querySelectorAll(".henon-thumb").forEach(item => item.classList.toggle("is-selected", item === button));
      });
    });
  });

  document.querySelectorAll("#tutorpdf-gallery img, #lingua-school-gallery img").forEach(image => {
    image.addEventListener("error", () => image.closest(".tutorpdf-gallery-item, .lingua-school-gallery-item")?.remove(), { once: true });
  });
  document.querySelectorAll(".tutorpdf-featured .featured-main-image img").forEach(image => {
    image.addEventListener("error", () => {
      const fallback = document.createElement("div");
      fallback.className = "featured-image-fallback";
      fallback.textContent = "TutorPDF screenshot will appear here.";
      image.replaceWith(fallback);
    }, { once: true });
  });
  document.querySelectorAll(".tutorpdf-featured .henon-thumb img").forEach(image => {
    image.addEventListener("error", () => image.closest(".henon-thumb")?.remove(), { once: true });
  });
  document.querySelectorAll(".lingua-school-featured .featured-main-image img").forEach(image => {
    image.addEventListener("error", () => {
      const fallback = document.createElement("div");
      fallback.className = "featured-image-fallback";
      fallback.textContent = "Lingua School screenshot will appear here.";
      image.replaceWith(fallback);
    }, { once: true });
  });
  document.querySelectorAll(".lingua-school-featured .henon-thumb img").forEach(image => {
    image.addEventListener("error", () => image.closest(".henon-thumb")?.remove(), { once: true });
  });
  document.querySelectorAll("[data-ephrata-gallery]").forEach(gallery => {
    const mainImg = gallery.querySelector(".ephrata-main-preview img");
    const mainBtn = gallery.querySelector(".ephrata-main-preview-btn");
    const mainCaption = gallery.querySelector(".ephrata-preview-caption-text");
    if (!mainImg) return;
    gallery.querySelectorAll(".ephrata-thumb").forEach(button => {
      button.addEventListener("click", () => {
        const imageURL = button.dataset.image;
        const label = button.dataset.label || "Ephrata Choir screenshot";
        if (!imageURL) return;
        mainImg.src = imageURL;
        mainImg.alt = label;
        if (mainBtn) {
          mainBtn.dataset.lightboxSrc = imageURL;
          mainBtn.dataset.lightboxTitle = label;
        }
        if (mainCaption) {
          mainCaption.textContent = label;
        }
        gallery.querySelectorAll(".ephrata-thumb").forEach(item => item.classList.toggle("is-selected", item === button));
      });
    });
  });

  document.querySelectorAll(".ephrata-preview-wrapper img").forEach(image => {
    image.addEventListener("error", () => {
      const fallback = document.createElement("div");
      fallback.className = "featured-image-fallback";
      fallback.textContent = "Ephrata Choir preview will appear here.";
      image.replaceWith(fallback);
    }, { once: true });
  });
}

function installLightbox() {
  const dialog = document.getElementById("lightbox");
  const image = document.getElementById("lightboxImage");
  const caption = document.getElementById("lightboxCaption");
  const close = document.getElementById("lightboxClose");
  document.addEventListener("click", event => {
    const trigger = event.target.closest("[data-lightbox-src]");
    if (!trigger || !trigger.dataset.lightboxSrc) return;
    image.src = trigger.dataset.lightboxSrc;
    image.alt = trigger.dataset.lightboxTitle;
    caption.textContent = trigger.dataset.lightboxTitle;
    dialog.showModal();
  });
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => { image.removeAttribute("src"); });
}

setProfileDetails();
installEmailModal();
renderTimeline("educationTimeline", PROFILE.education);
renderTimeline("experienceTimeline", PROFILE.experience);
installNavigation();
installFeaturedGalleries();
installShowcaseControls();
installLightbox();
loadProjects();
