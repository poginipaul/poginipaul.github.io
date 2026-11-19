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

  /* ------------------------------------------------------------- Navigation
     One navigation tree at every size. The browser gives us the collapsed
     menu for free (popover: top layer, light dismiss, Escape, focus return);
     script only decides whether the same list is inline or collapsed by
     measuring the header row, so text size and translations are accounted
     for without hard-coded breakpoints. */
  var header = document.querySelector(".site-header");
  var headerInner = header ? header.querySelector(".header-inner") : null;
  var nav = document.querySelector(".nav");
  var navToggle = document.querySelector(".nav-toggle");
  var navList = document.getElementById("nav-list");
  var hasPopover = Object.hasOwn(HTMLElement.prototype, "popover");

  if (header && headerInner && nav && navToggle && navList) {
    if (hasPopover) {
      var syncNavLayout = function () {
        var wasOpen = navList.matches(":popover-open");

        // Close before dropping the attribute: whether an open popover keeps
        // its top-layer placement after that is left to the browser.
        if (wasOpen) navList.hidePopover();

        // Measure the inline row without animating it.
        headerInner.classList.add("is-measuring");
        header.classList.add("is-wide");
        navList.removeAttribute("popover");

        var fits = headerInner.scrollWidth <= headerInner.clientWidth + 1;

        if (!fits) {
          header.classList.remove("is-wide");
          navList.setAttribute("popover", "auto");
          if (wasOpen) navList.showPopover();
        }

        window.requestAnimationFrame(function () {
          headerInner.classList.remove("is-measuring");
        });
      };

      syncNavLayout();

      if ("ResizeObserver" in window) {
        new ResizeObserver(syncNavLayout).observe(headerInner);
      }

      // Web fonts change the width of the links after first layout.
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(syncNavLayout).catch(function () {});
      }

      // Following a link leaves the menu open; dismiss it like a light dismiss.
      navList.addEventListener("click", function (event) {
        if (event.target.closest("a") && navList.matches(":popover-open")) {
          navList.hidePopover();
        }
      });
    } else {
      /* Fallback for browsers without the Popover API. */
      navToggle.setAttribute("aria-expanded", "false");

      var setNavOpen = function (open) {
        nav.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      };

      navToggle.addEventListener("click", function () {
        setNavOpen(!nav.classList.contains("is-open"));
      });

      navList.addEventListener("click", function (event) {
        if (event.target.closest("a")) setNavOpen(false);
      });

      document.addEventListener("click", function (event) {
        if (nav.classList.contains("is-open") && !nav.contains(event.target)) {
          setNavOpen(false);
        }
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && nav.classList.contains("is-open")) {
          setNavOpen(false);
          navToggle.focus();
        }
      });
    }
  }

  /* ------------------------------------------------------- Header shadow */
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

  /* ------------------------------------------------------------- Scrollspy
     Browsers with scroll-target-group highlight the link whose section is in
     view (:target-current), with no scroll listener at all. Script mirrors
     that state into aria-current and falls back to an IntersectionObserver. */
  var sections = Array.prototype.slice.call(
    document.querySelectorAll("main section[id]")
  );
  var navLinks = navList
    ? Array.prototype.slice.call(navList.querySelectorAll('a[href^="#"]'))
    : [];

  function markCurrent(link) {
    navLinks.forEach(function (item) {
      var isCurrent = item === link;
      item.classList.toggle("target-current", isCurrent);
      if (isCurrent) {
        item.setAttribute("aria-current", "true");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  }

  if (navList && sections.length && navLinks.length) {
    if (CSS.supports("scroll-target-group: auto")) {
      var currentLink = null;

      // :target-current is computed natively and continuously, so mirror it
      // every frame while scrolling rather than only once scrolling stops.
      var syncCurrent = function () {
        var found = navList.querySelector("a:target-current");
        if (found === currentLink) return;
        currentLink = found;
        markCurrent(found);
      };

      // :target-current settles one task after the scrolling ends.
      var onScrollEnd = function () {
        window.setTimeout(syncCurrent, 0);
      };

      syncCurrent();
      window.addEventListener("scrollend", onScrollEnd);
      window.addEventListener("resize", onScrollEnd);

      if (!("onscrollend" in window)) {
        var settleTimer;
        window.addEventListener(
          "scroll",
          function () {
            window.clearTimeout(settleTimer);
            settleTimer = window.setTimeout(syncCurrent, 160);
          },
          { passive: true }
        );
      }

      // The list starts in the top layer; re-sync when it comes back inline.
      navList.addEventListener("toggle", function (event) {
        if (event.newState === "open") syncCurrent();
      });
    } else if ("IntersectionObserver" in window) {
      var spyObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var match = navLinks.filter(function (link) {
              return link.getAttribute("href") === "#" + entry.target.id;
            })[0];
            if (match) markCurrent(match);
          });
        },
        { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
      );

      sections.forEach(function (section) {
        spyObserver.observe(section);
      });
    }
  }

  /* ------------------------------------------------------------- Footer */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
