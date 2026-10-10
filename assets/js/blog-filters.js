/**
 * Filter and sort bar for the blog page.
 *
 * Progressive enhancement: the page already renders every post in reverse
 * chronological order, and each pill is a real link to its archive page, so
 * with JavaScript off nothing is lost. When this runs, the pills filter the
 * list in place instead of navigating away.
 *
 * The active filter is mirrored into the URL fragment (#category=dissertation,
 * #tag=python) so a filtered view can be linked to.
 */
document.addEventListener("DOMContentLoaded", () => {
  const bar = document.querySelector("[data-blog-filters]");
  const list = document.querySelector("[data-blog-list]");
  if (!bar || !list) return;

  const items = Array.from(list.querySelectorAll("[data-post]"));
  const pills = Array.from(bar.querySelectorAll("[data-filter-type]"));
  const sortSelect = bar.querySelector("[data-blog-sort]");
  const status = bar.querySelector("[data-blog-status]");
  const highlights = document.querySelector("[data-blog-highlights]");
  const empty = document.querySelector("[data-blog-empty]");
  const reset = document.querySelector("[data-blog-reset]");
  const tagDetails = bar.querySelector("[data-blog-tags]");

  let active = { type: "all", value: "" };

  const tokens = (item, type) => (item.dataset[type === "category" ? "categories" : "tags"] || "").split(/\s+/).filter(Boolean);

  const matches = (item) => active.type === "all" || tokens(item, active.type).includes(active.value);

  function render() {
    let shown = 0;
    items.forEach((item) => {
      const visible = matches(item);
      item.hidden = !visible;
      if (visible) shown += 1;
    });

    pills.forEach((pill) => {
      const isActive = pill.dataset.filterType === active.type && (active.type === "all" || pill.dataset.filterValue === active.value);
      pill.classList.toggle("active", isActive);
      if (isActive) {
        pill.setAttribute("aria-current", "true");
      } else {
        pill.removeAttribute("aria-current");
      }
    });

    // The highlights row is a deliberately mixed selection, so it only makes
    // sense while the list is unfiltered.
    if (highlights) highlights.hidden = active.type !== "all";
    if (empty) empty.hidden = shown !== 0;

    // Tags are collapsed by default, so reveal them when one is the active
    // filter — otherwise a #tag= deep link would hide the pill it just set.
    if (tagDetails && active.type === "tag") tagDetails.open = true;

    if (status) {
      status.textContent = shown === items.length ? `${items.length} posts` : `${shown} of ${items.length} posts`;
    }
  }

  function sortList(mode) {
    const ordered = items.slice().sort((a, b) => {
      if (mode === "title") return a.dataset.title.localeCompare(b.dataset.title);
      const diff = Number(a.dataset.date) - Number(b.dataset.date);
      return mode === "oldest" ? diff : -diff;
    });
    const fragment = document.createDocumentFragment();
    ordered.forEach((item) => fragment.appendChild(item));
    list.appendChild(fragment);
  }

  function setFilter(type, value, { updateHash = true } = {}) {
    active = type === "all" ? { type: "all", value: "" } : { type, value };
    if (updateHash) {
      const target = active.type === "all" ? window.location.pathname + window.location.search : `#${active.type}=${active.value}`;
      history.replaceState(null, "", target);
    }
    render();
  }

  pills.forEach((pill) => {
    pill.addEventListener("click", (event) => {
      event.preventDefault();
      const { filterType, filterValue } = pill.dataset;
      // Clicking the active pill clears it, so the bar is a toggle.
      const isActive = filterType === active.type && (filterType === "all" || filterValue === active.value);
      setFilter(isActive ? "all" : filterType, filterValue);
    });
  });

  if (reset) {
    reset.addEventListener("click", (event) => {
      event.preventDefault();
      setFilter("all", "");
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => sortList(sortSelect.value));
  }

  // Honour an incoming #category=... / #tag=... fragment.
  const match = /^#(category|tag)=(.+)$/.exec(window.location.hash);
  if (match) {
    const [, type, value] = match;
    const decoded = decodeURIComponent(value);
    const known = pills.some((pill) => pill.dataset.filterType === type && pill.dataset.filterValue === decoded);
    if (known) {
      setFilter(type, decoded, { updateHash: false });
      return;
    }
  }

  render();
});
