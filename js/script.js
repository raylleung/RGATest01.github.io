(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var siteNav = document.getElementById("siteNav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    siteNav.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  function setActiveNav() {
    var scrollPos = window.scrollY + 120;
    var current = sections[0];
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) current = sec;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + current.id);
    });
  }
  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  /* ---------- Accordion (Key Findings) ---------- */
  document.querySelectorAll(".accordion-item").forEach(function (item) {
    var trigger = item.querySelector(".accordion-trigger");
    trigger.addEventListener("click", function () {
      item.classList.toggle("is-open");
    });
  });

  /* ---------- Shoe comparison tabs ---------- */
  var shoeTabs = document.querySelectorAll(".shoe-tab");
  shoeTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var shoe = tab.getAttribute("data-shoe");
      shoeTabs.forEach(function (t) { t.classList.toggle("is-active", t === tab); });
      document.querySelectorAll(".shoe-panel").forEach(function (panel) {
        panel.classList.toggle("is-active", panel.getAttribute("data-shoe-panel") === shoe);
      });
    });
  });

  /* ---------- Return-to-running stepper ---------- */
  var steps = document.querySelectorAll(".step");
  steps.forEach(function (step) {
    step.addEventListener("click", function () {
      var n = step.getAttribute("data-step");
      steps.forEach(function (s) { s.classList.toggle("is-active", s === step); });
      document.querySelectorAll(".step-panel").forEach(function (panel) {
        panel.classList.toggle("is-active", panel.getAttribute("data-step-panel") === n);
      });
    });
  });

  /* ---------- 8-week training tabs ---------- */
  var weekTabs = document.querySelectorAll(".week-tab");
  weekTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var w = tab.getAttribute("data-week");
      weekTabs.forEach(function (t) { t.classList.toggle("is-active", t === tab); });
      document.querySelectorAll(".week-panel").forEach(function (panel) {
        panel.classList.toggle("is-active", panel.getAttribute("data-week-panel") === w);
      });
    });
  });

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("is-visible", window.scrollY > 700);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll(".section-inner");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Race readiness estimate bars ---------- */
  function parseTimeToSeconds(str, fmt) {
    var parts = str.split(":").map(Number);
    if (fmt === "hmmss" || parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return parts[0] * 60 + parts[1];
  }

  document.querySelectorAll(".estimate-card").forEach(function (card) {
    var min = Number(card.getAttribute("data-min"));
    var max = Number(card.getAttribute("data-max"));
    var markerVals = [];
    ["1", "2"].forEach(function (n) {
      var v = card.getAttribute("data-marker" + n);
      if (v) markerVals.push(Number(v));
    });

    var domainMin = Math.min(min, max, markerVals.length ? Math.min.apply(null, markerVals) : min);
    var domainMax = Math.max(min, max, markerVals.length ? Math.max.apply(null, markerVals) : max);
    var pad = (domainMax - domainMin) * 0.15 || 30;
    domainMin -= pad;
    domainMax += pad;

    function pct(v) { return ((v - domainMin) / (domainMax - domainMin)) * 100; }

    var fill = card.querySelector(".estimate-fill");
    if (fill) {
      fill.style.left = pct(min) + "%";
      fill.style.width = (pct(max) - pct(min)) + "%";
    }

    ["1", "2"].forEach(function (n) {
      var v = card.getAttribute("data-marker" + n);
      var label = card.getAttribute("data-marker" + n + "-label");
      var el = card.querySelector('.estimate-marker[data-m="' + n + '"]');
      if (v && el) {
        el.style.left = pct(Number(v)) + "%";
        el.setAttribute("data-label", label || "");
      }
    });
  });

  /* ---------- Charts ---------- */
  function buildCharts() {
    if (typeof Chart === "undefined") return;

    Chart.defaults.font.family = "Inter, sans-serif";
    Chart.defaults.color = "#48433c";

    var stone500 = "#7a7a7a";        // neutral gray (cadence lines)
    var accent = "#b8471f";          // infographic accent (Boston / pace)
    var compareCloud = "#3f3f3f";    // charcoal (Cloudflyer in comparison)

    var bostonPace = [4.65, 4.30, 4.15];   // decimal minutes (4:39, 4:18, 4:09)
    var bostonCadence = [175, 181, 186];
    var cloudPace = [4.667, 4.15, 4.033];  // 4:40, 4:09, 4:02
    var cloudCadence = [180, 182, 182];
    var labels = ["Rep 1", "Rep 2", "Rep 3"];

    function paceTickLabel(v) {
      var mins = Math.floor(v);
      var secs = Math.round((v - mins) * 60);
      if (secs === 60) { mins += 1; secs = 0; }
      return mins + ":" + (secs < 10 ? "0" : "") + secs;
    }

    var elBoston = document.getElementById("chartBostonReps");
    if (elBoston) {
      new Chart(elBoston, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Pace (min/km)",
              data: bostonPace,
              borderColor: accent,
              backgroundColor: accent,
              yAxisID: "y",
              tension: 0.3,
              pointRadius: 5
            },
            {
              label: "Cadence (spm)",
              data: bostonCadence,
              borderColor: stone500,
              backgroundColor: stone500,
              yAxisID: "y1",
              tension: 0.3,
              pointRadius: 5,
              borderDash: [4, 3]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                label: function (ctx) {
                  if (ctx.dataset.yAxisID === "y") return "Pace: " + paceTickLabel(ctx.parsed.y) + "/km";
                  return "Cadence: " + ctx.parsed.y + " spm";
                }
              }
            }
          },
          scales: {
            y: {
              reverse: true,
              title: { display: true, text: "Pace (faster →)" },
              ticks: { callback: function (v) { return paceTickLabel(v); } }
            },
            y1: {
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: "Cadence (spm)" }
            }
          }
        }
      });
    }

    var elCloud = document.getElementById("chartCloudflyerReps");
    if (elCloud) {
      new Chart(elCloud, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Pace (min/km)",
              data: cloudPace,
              borderColor: accent,
              backgroundColor: accent,
              yAxisID: "y",
              tension: 0.3,
              pointRadius: 5
            },
            {
              label: "Cadence (spm)",
              data: cloudCadence,
              borderColor: stone500,
              backgroundColor: stone500,
              yAxisID: "y1",
              tension: 0.3,
              pointRadius: 5,
              borderDash: [4, 3]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                label: function (ctx) {
                  if (ctx.dataset.yAxisID === "y") return "Pace: " + paceTickLabel(ctx.parsed.y) + "/km";
                  return "Cadence: " + ctx.parsed.y + " spm";
                }
              }
            }
          },
          scales: {
            y: {
              reverse: true,
              title: { display: true, text: "Pace (faster →)" },
              ticks: { callback: function (v) { return paceTickLabel(v); } }
            },
            y1: {
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: "Cadence (spm)" }
            }
          }
        }
      });
    }

    var elCompare = document.getElementById("chartShoeCompare");
    if (elCompare) {
      new Chart(elCompare, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Boston 13 — Pace",
              data: bostonPace,
              borderColor: accent,
              backgroundColor: accent,
              tension: 0.3,
              pointRadius: 6,
              pointHoverRadius: 8,
              borderWidth: 3
            },
            {
              label: "Cloudflyer — Pace",
              data: cloudPace,
              borderColor: compareCloud,
              backgroundColor: compareCloud,
              tension: 0.3,
              pointRadius: 6,
              pointHoverRadius: 8,
              borderWidth: 3,
              borderDash: [6, 4]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                label: function (ctx) { return ctx.dataset.label.split(" — ")[0] + ": " + paceTickLabel(ctx.parsed.y) + "/km"; }
              }
            }
          },
          scales: {
            y: {
              reverse: true,
              min: 3.9,
              max: 4.8,
              title: { display: true, text: "Pace per km (faster →)" },
              ticks: { stepSize: 0.1, callback: function (v) { return paceTickLabel(v); } }
            }
          }
        }
      });
    }
  }

  if (document.readyState === "complete") {
    buildCharts();
  } else {
    window.addEventListener("load", buildCharts);
  }
})();
