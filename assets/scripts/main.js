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