(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------------------------------------------------------------- Theme */
  var themeToggle = document.querySelector(".theme-toggle");
  var storedTheme = null;

  try {
    storedTheme = localStorage.getItem("theme");
  } catch (error) {
    storedTheme = null;
  }

  if (storedTheme === "light" || storedTheme === "dark") {
    root.setAttribute("data-theme", storedTheme);
  }

  function isDark() {
    var explicit = root.getAttribute("data-theme");
    if (explicit) return explicit === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function syncThemeButton() {
    if (!themeToggle) return;
    themeToggle.setAttribute(
      "aria-label",
      isDark() ? "Switch to light theme" : "Switch to dark theme"
    );
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (error) {
        /* storage unavailable — the toggle still works for this session */
      }
      syncThemeButton();
    });
    syncThemeButton();
  }

  var scheme = window.matchMedia("(prefers-color-scheme: dark)");
  var onSchemeChange = function () {
    if (!root.getAttribute("data-theme")) syncThemeButton();
  };
  if (typeof scheme.addEventListener === "function") {
    scheme.addEventListener("change", onSchemeChange);
  }

  /* ----------------------------------------------------------- Mobile nav */
  var nav = document.querySelector(".nav");
  var navToggle = document.querySelector(".nav-toggle");
  var navList = document.getElementById("nav-list");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    if (navList) {
      navList.addEventListener("click", function (event) {
        if (event.target.closest("a")) closeNav();
      });
    }

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (!nav.contains(event.target)) closeNav();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeNav();
        navToggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) closeNav();
    });
  }

  /* ------------------------------------------------------- Header shadow */
  var header = document.querySelector(".site-header");
  var ticking = false;

  function onScroll() {
    if (!header || ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* -------------------------------------------- Reveal on scroll (motion) */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ------------------------------------------------------------- Scrollspy */
  var sections = Array.prototype.slice.call(
    document.querySelectorAll("main section[id]")
  );
  var navLinks = navList
    ? Array.prototype.slice.call(navList.querySelectorAll("a"))
    : [];

  function setActive(id) {
    navLinks.forEach(function (link) {
      var matches = link.getAttribute("href") === "#" + id;
      if (matches) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if (sections.length && navLinks.length) {
    var spyTicking = false;

    var updateActive = function () {
      var probe = window.scrollY + 120;
      var activeId = sections[0].id;

      sections.forEach(function (section) {
        if (section.offsetTop <= probe) activeId = section.id;
      });

      // At the very bottom of the page the last section is the one in view.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        activeId = sections[sections.length - 1].id;
      }

      setActive(activeId);
    };

    var onSpyScroll = function () {
      if (spyTicking) return;
      spyTicking = true;
      window.requestAnimationFrame(function () {
        updateActive();
        spyTicking = false;
      });
    };

    window.addEventListener("scroll", onSpyScroll, { passive: true });
    window.addEventListener("resize", onSpyScroll);
    updateActive();
  }

  /* ------------------------------------------------------------- Footer */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
