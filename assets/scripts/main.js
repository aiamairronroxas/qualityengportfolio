// main.js: shows one page at a time, dark mode, email popup, scrolling strips, and photo slideshow.

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

  // Start each page at the top (the window on phones, the content area on desktop)
  window.scrollTo(0, 0);
  document.getElementById("main").scrollTop = 0;
}

// ---- 3. Clicks on any in-page link (sidebar, buttons, dashboard cards) ----
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
    // Ignore links whose address has changed to something other than a page (like a Drive link)
    if (!(link.getAttribute("href") || "").startsWith("#")) return;
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

// ---- 7. Marquees (Skills and Tools): copy each row once so the loop never has a gap ----
document.querySelectorAll(".marquee-track").forEach((track) => {
  const copy = track.firstElementChild.cloneNode(true);
  copy.setAttribute("aria-hidden", "true");   // screen readers skip the duplicate
  track.appendChild(copy);
});

// ---- 8. Flat carousels: the Experience photos and the project picture window ----
// Middle picture big, neighbors smaller, Back and Next buttons, dots, and an automatic change every few seconds.
const FLAT_SECONDS = 1.5;   // time between automatic changes (change this number)
// Auto-change is off for people who asked their device to reduce motion
const flatAutoplay = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupFlatCarousel(root) {
  const cards = root.querySelectorAll(".flat-card");
  const dotsBox = root.querySelector(".slide-dots");
  let index = 0;
  let timer = null;

  // Set up each picture: a blurred backdrop from its own image, a dot, and click-to-center
  cards.forEach((card, i) => {
    const img = card.querySelector("img");
    card.style.setProperty("--bg", 'url("' + img.getAttribute("src") + '")');

    card.addEventListener("click", () => { if (card.dataset.pos !== "0") { goTo(i); start(); } });

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slide-dot";
    dot.setAttribute("aria-label", "Show picture " + (i + 1));
    dot.addEventListener("click", () => { goTo(i); start(); });
    dotsBox.appendChild(dot);
  });
  const dots = dotsBox.querySelectorAll(".slide-dot");

  // Give every picture its position relative to the one in the middle
  function layout() {
    const n = cards.length;
    cards.forEach((card, i) => {
      let d = (i - index + n) % n;
      if (d > n / 2) d -= n;                        // shortest way around: ... -2 -1 0 1 2 ...
      const pos = Math.max(-3, Math.min(3, d));
      const before = Number(card.dataset.pos);

      // A picture jumping from one far side to the other would sweep across the middle: skip its animation
      if (!Number.isNaN(before) && Math.abs(pos - before) > 2) {
        card.classList.add("no-anim");
        card.dataset.pos = pos;
        void card.offsetWidth;                      // makes the browser apply it right away
        card.classList.remove("no-anim");
      } else {
        card.dataset.pos = pos;
      }
      card.setAttribute("aria-hidden", pos !== 0);
    });
    dots.forEach((dot, k) => {
      dot.classList.toggle("is-active", k === index);
      dot.setAttribute("aria-current", k === index);
    });
  }

  function goTo(i) {
    index = (i + cards.length) % cards.length;      // wraps around at both ends
    layout();
  }

  // Automatic change (only while the carousel is on screen)
  function stop() { clearInterval(timer); timer = null; }
  function start() {
    stop();
    if (!flatAutoplay) return;
    timer = setInterval(() => {
      if (root.offsetParent !== null) goTo(index + 1);
    }, FLAT_SECONDS * 1000);
  }

  // Back and Next buttons
  root.querySelector(".flat-prev").addEventListener("click", () => { goTo(index - 1); start(); });
  root.querySelector(".flat-next").addEventListener("click", () => { goTo(index + 1); start(); });

  // Pause while a mouse is over the carousel (touch taps don't count, so phones never get stuck)
  root.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") stop(); });
  root.addEventListener("pointerleave", (event) => { if (event.pointerType === "mouse") start(); });

  // Left and Right arrow keys while the carousel has focus
  root.tabIndex = -1;
  root.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { goTo(index - 1); start(); }
    if (event.key === "ArrowRight") { goTo(index + 1); start(); }
  });

  // Swipe on touch screens
  let touchX = 0;
  root.addEventListener("touchstart", (event) => { touchX = event.touches[0].clientX; }, { passive: true });
  root.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - touchX;
    if (Math.abs(distance) > 40) { goTo(index + (distance < 0 ? 1 : -1)); start(); }
  });

  goTo(0);
  start();
  return { root, goTo, start, stop };
}

// Set up every flat carousel on the page (keeps them so the project window can control its own)
const flatControllers = new Map();
document.querySelectorAll(".flat-carousel").forEach((root) => {
  flatControllers.set(root, setupFlatCarousel(root));
});
// ---- 9. Certification popup: click a card to see its details and certificate link ----
const certModal = document.getElementById("cert-modal");
const certClose = document.getElementById("cert-close");
let lastCertCard = null;   // remembers which card opened the popup, so focus can go back to it

function openCertModal(card) {
  lastCertCard = card;
  const data = card.dataset;

  document.getElementById("cert-modal-title").textContent = data.name;
  document.getElementById("cert-modal-issuer").textContent = data.issuer;
  document.getElementById("cert-modal-date").textContent = data.date;
  document.getElementById("cert-modal-id").textContent = data.id;
  document.getElementById("cert-modal-link").href = data.link;

  // The short description only shows for cards that have one (data-desc)
  const desc = document.getElementById("cert-modal-desc");
  desc.textContent = data.desc || "";
  desc.hidden = !data.desc;

  certModal.hidden = false;
  certClose.focus();
}

function closeCertModal() {
  certModal.hidden = true;
  if (lastCertCard) lastCertCard.focus();
}

document.querySelectorAll(".cert-card").forEach((card) => {
  card.addEventListener("click", () => openCertModal(card));
});

certClose.addEventListener("click", closeCertModal);

// Click the dark area outside the box to close
certModal.addEventListener("click", (event) => {
  if (event.target === certModal) closeCertModal();
});

// Press Esc to close
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !certModal.hidden) closeCertModal();
});
// ---- 10. Education photo carousel: make 3 extra copies of the row so the loop never has a gap ----
document.querySelectorAll(".photo-track").forEach((track) => {
  for (let i = 0; i < 3; i++) {
    const copy = track.firstElementChild.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");   // screen readers skip the duplicates
    track.appendChild(copy);
  }
});
// ---- 11. Project picture window: opens a big popup holding a flat carousel ----
const projectCard = document.getElementById("project-card");
const galleryModal = document.getElementById("gallery-modal");
const galleryClose = document.getElementById("gallery-close");
const galleryFlat = flatControllers.get(galleryModal.querySelector(".flat-carousel"));

function openGallery() {
  galleryModal.hidden = false;
  galleryFlat.goTo(0);          // always start from the first picture
  galleryFlat.start();
  galleryFlat.root.focus();     // so the Left and Right arrow keys work right away
}

function closeGallery() {
  galleryModal.hidden = true;
  galleryFlat.stop();
  projectCard.focus();
}

projectCard.addEventListener("click", openGallery);

// Keyboard: Enter or Space on the project card opens it too
projectCard.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openGallery();
  }
});

galleryClose.addEventListener("click", closeGallery);

// Click the dark area outside the window to close
galleryModal.addEventListener("click", (event) => {
  if (event.target === galleryModal) closeGallery();
});

// Press Esc to close
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !galleryModal.hidden) closeGallery();
});