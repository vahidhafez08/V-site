/*
 * Optional public links. Fill these in only when ready to publish them.
 * Leave a value as an empty string to keep that item hidden.
 */
const VSOFT_SITE_CONFIG = {
  contactEmail: "",
  marketplaceLinks: {
    vesta: ""
  }
};

const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeIcon = document.querySelector("[data-theme-icon]");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".nav");
const header = document.querySelector(".site-header");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

function applyTheme(theme) {
  const safeTheme = theme === "light" ? "light" : "dark";
  root.dataset.theme = safeTheme;
  if (themeIcon) themeIcon.textContent = safeTheme === "dark" ? "☼" : "☾";
  if (themeToggle) {
    const label = root.lang === "fa"
      ? (safeTheme === "dark" ? "فعال‌کردن پوسته روشن" : "فعال‌کردن پوسته تیره")
      : (safeTheme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    themeToggle.setAttribute("aria-label", label);
    themeToggle.title = label;
  }
  if (themeColorMeta) themeColorMeta.content = safeTheme === "dark" ? "#0c1018" : "#f5f7fa";
}

let savedTheme = "";
try {
  savedTheme = localStorage.getItem("vsoft-theme") || "";
} catch (_) {
  savedTheme = "";
}
applyTheme(savedTheme || "dark");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    try {
      localStorage.setItem("vsoft-theme", nextTheme);
    } catch (_) {
      // Theme still works for the current page if storage is unavailable.
    }
  });
}

function closeMenu() {
  if (!menuToggle || !navigation) return;
  menuToggle.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");
  menuToggle.setAttribute("aria-label", root.lang === "fa" ? "باز کردن منو" : "Open menu");
}

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    navigation.classList.toggle("is-open", !isOpen);
    menuToggle.setAttribute("aria-label", root.lang === "fa"
      ? (!isOpen ? "بستن منو" : "باز کردن منو")
      : (!isOpen ? "Close menu" : "Open menu"));
  });
  navigation.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 600) closeMenu();
  });
}

function updateHeader() {
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
}
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  root.classList.add("js-motion");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));

  if (navSections.length) {
    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-22% 0px -62% 0px", threshold: 0 });
    navSections.forEach((section) => activeObserver.observe(section));
  }
} else {
  document.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));
}

const emailLink = document.querySelector("[data-contact-email]");
const contactSection = document.querySelector("[data-contact-section]");
const contactNav = document.querySelector("[data-contact-nav]");

if (VSOFT_SITE_CONFIG.contactEmail.trim()) {
  const email = VSOFT_SITE_CONFIG.contactEmail.trim();
  if (emailLink) {
    emailLink.href = "mailto:" + email;
    emailLink.hidden = false;
  }
  if (contactSection) contactSection.hidden = false;
  if (contactNav) contactNav.hidden = false;
}

document.querySelectorAll("[data-marketplace]").forEach((link) => {
  const key = link.getAttribute("data-marketplace");
  const url = key ? VSOFT_SITE_CONFIG.marketplaceLinks[key] : "";
  if (typeof url === "string" && url.trim()) {
    link.href = url.trim();
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.hidden = false;
  }
});