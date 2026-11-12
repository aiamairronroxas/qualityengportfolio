// main.js: shows one page at a time and handles the phone menu.

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelectorAll(".nav a");
const panels = document.querySelectorAll(".panel");

// ---- 1. Phone menu: the "Menu" button opens and closes the sidebar menu ----
function setMenu(open) {
  sidebar.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", open);
  menuToggle.textContent = open ? "Close" : "Menu";
}

menuToggle.addEventListener("click", () => {
  setMenu(!sidebar.classList.contains("is-open"));
});

// ---- 2. Show one page, hide the others ----
function showPanel(id) {
  // If the id doesn't match a page, fall back to Home
  if (!document.getElementById(id)) id = "home";

  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === id);
  });

  // Highlight the matching sidebar link
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
  });

  window.scrollTo(0, 0); // start each page at the top
}

// ---- 3. Clicks on any in-page link (sidebar, buttons, dashboard cards) ----
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();                      // stop the normal jump/scroll
    const id = link.getAttribute("href").slice(1);
    showPanel(id);
    history.pushState(null, "", "#" + id);       // keeps the Back button working
    setMenu(false);                              // close the phone menu
  });
});

// Back/Forward buttons
window.addEventListener("popstate", () => {
  showPanel(location.hash.slice(1) || "home");
});

// ---- 4. On page load, open the page named in the address (or Home) ----
showPanel(location.hash.slice(1) || "home");

// ---- 5. Dark mode: the moon/sun button switches the theme and remembers it ----
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

function updateThemeButton() {
  const isDark = root.getAttribute("data-theme") === "dark";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  themeToggle.title = isDark ? "Light mode" : "Dark mode";
}

themeToggle.addEventListener("click", () => {
  const goDark = root.getAttribute("data-theme") !== "dark";
  if (goDark) {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }
  try { localStorage.setItem("theme", goDark ? "dark" : "light"); } catch (e) {}
  updateThemeButton();
});

updateThemeButton();
// ---- 6. Email popup: opens from the email icon, click the address to copy ----
const emailButton = document.getElementById("email-button");
const emailModal = document.getElementById("email-modal");
const emailClose = document.getElementById("email-close");
const copyEmail = document.getElementById("copy-email");
const copyStatus = document.getElementById("copy-status");

function openEmailModal() {
  emailModal.hidden = false;
  copyStatus.textContent = "";
  copyEmail.focus();
}

function closeEmailModal() {
  emailModal.hidden = true;
  emailButton.focus();
}

emailButton.addEventListener("click", (event) => {
  event.preventDefault();               // don't open the mail app
  openEmailModal();
});

emailClose.addEventListener("click", closeEmailModal);

// Click the dark area outside the box to close
emailModal.addEventListener("click", (event) => {
  if (event.target === emailModal) closeEmailModal();
});

// Press Esc to close
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !emailModal.hidden) closeEmailModal();
});

// Click the address to copy it
copyEmail.addEventListener("click", async () => {
  const email = copyEmail.textContent.trim();
  try {
    await navigator.clipboard.writeText(email);
    copyStatus.textContent = "Copied!";
  } catch (error) {
    // Fallback: select the text so the visitor can press Ctrl+C
    const range = document.createRange();
    range.selectNodeContents(copyEmail);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = "Press Ctrl + C to copy";
  }
});