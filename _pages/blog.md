---
layout: default
permalink: /blog/
title: blog
nav: true
nav_order: 4
blog_filters: true
---

<div class="post">

{% assign blog_name_size = site.blog_name | size %}
{% assign blog_description_size = site.blog_description | size %}

{% if blog_name_size > 0 or blog_description_size > 0 %}

  <div class="header-bar">
    <h1>{{ site.blog_name }}</h1>
    <h2>{{ site.blog_description }}</h2>
  </div>
  {% endif %}

{% comment %}
---

Highlights ("Start here"). Fills up to `max` slots in this order:

1. posts with `featured: true`
2. posts with an `importance:` value, lowest first
3. the most recent post from each category in site.blog_highlights.categories
   Selection is tracked as a comma-terminated string of URLs so a post is never
   shown twice.

---
{% endcomment %}

{% assign highlights = site.blog_highlights %}
{% if highlights.enabled %}

{% assign highlight_max = highlights.max | default: 4 %}
{% assign highlight_urls = "" %}
{% assign highlight_badges = "" %}
{% assign highlight_count = 0 %}

{% assign pinned_featured = site.posts | where: "featured", "true" %}
{% for post in pinned_featured %}
    {% if highlight_count >= highlight_max %}{% break %}{% endif %}
    {% assign url_key = post.url | append: "," %}
    {% unless highlight_urls contains url_key %}
      {% assign highlight_urls = highlight_urls | append: url_key %}
      {% assign highlight_badges = highlight_badges | append: "," %}
      {% assign highlight_count = highlight_count | plus: 1 %}
    {% endunless %}
{% endfor %}

{% assign pinned_important = site.posts | where_exp: "post", "post.importance" | sort: "importance" %}
{% for post in pinned_important %}
    {% if highlight_count >= highlight_max %}{% break %}{% endif %}
    {% assign url_key = post.url | append: "," %}
    {% unless highlight_urls contains url_key %}
      {% assign highlight_urls = highlight_urls | append: url_key %}
      {% assign highlight_badges = highlight_badges | append: "," %}
      {% assign highlight_count = highlight_count | plus: 1 %}
    {% endunless %}
{% endfor %}

{% for category in highlights.categories %}
    {% if highlight_count >= highlight_max %}{% break %}{% endif %}
    {% assign category_posts = site.posts | where: "categories", category %}
    {% for post in category_posts %}
      {% assign url_key = post.url | append: "," %}
      {% unless highlight_urls contains url_key %}
        {% assign highlight_urls = highlight_urls | append: url_key %}
        {% assign highlight_badges = highlight_badges | append: category | append: "," %}
        {% assign highlight_count = highlight_count | plus: 1 %}
        {% break %}
      {% endunless %}
    {% endfor %}
{% endfor %}

{% if highlight_count > 0 %}
    {% assign highlight_url_list = highlight_urls | split: "," %}
    {% assign highlight_badge_list = highlight_badges | split: "," %}

<div class="blog-highlights" data-blog-highlights>
  <div class="row row-cols-1 row-cols-md-3">
    {% for highlight_url in highlight_url_list %}
      {% assign highlight_post = site.posts | where: "url", highlight_url | first %}
      {% if highlight_post %}
        {% assign badge = highlight_badge_list[forloop.index0] %}
        {% include blog_highlight_card.liquid post=highlight_post badge=badge %}
      {% endif %}
    {% endfor %}
  </div>
</div>

{% endif %}
{% endif %}

{% comment %}
---

Filter + sort bar. Pills are real links to the archive pages, so the bar still
works with JavaScript off; blog-filters.js intercepts them and filters the list
below in place. site.display_categories / site.display_tags pick and order the
pills, and an empty list means "every one the posts use".
---------------------------------------------------------------------------
{% endcomment %}

{% if site.display_categories and site.display_categories.size > 0 %}
{% assign filter_categories = site.display_categories %}
{% else %}
{% assign category_names = "" %}
{% for item in site.categories %}
    {% assign category_names = category_names | append: item[0] | append: "," %}
{% endfor %}
{% assign filter_categories = category_names | split: "," | sort_natural %}
{% endif %}

{% if site.display_tags and site.display_tags.size > 0 %}
{% assign filter_tags = site.display_tags %}
{% else %}
{% assign tag_names = "" %}
{% for item in site.tags %}
    {% assign tag_names = tag_names | append: item[0] | append: "," %}
{% endfor %}
{% assign filter_tags = tag_names | split: "," | sort_natural %}
{% endif %}

{% assign total_posts = site.posts | size %}

<div class="blog-filters" data-blog-filters>

  <div class="filter-bar">

{% if filter_categories.size > 0 %}
      <ul class="filter-pills" role="group" aria-label="Filter posts by category">
        <li>
          <a class="filter-pill active" href="{{ '/blog/' | relative_url }}" aria-current="true" data-filter-type="all">all <span class="filter-count">{{ total_posts }}</span></a>
        </li>
        {% for category in filter_categories %}
          {% assign category_posts = site.posts | where: "categories", category %}
          {% if category_posts.size > 0 %}
            <li>
              <a
                class="filter-pill"
                href="{{ category | slugify | prepend: '/blog/category/' | relative_url }}"
                data-filter-type="category"
                data-filter-value="{{ category | slugify }}"
              >
                {{ category }} <span class="filter-count">{{ category_posts.size }}</span>
              </a>
            </li>
          {% endif %}
        {% endfor %}
      </ul>
{% endif %}

    <div class="filter-controls">
      <select class="blog-sort" data-blog-sort aria-label="Sort posts">
        <option value="newest" selected>Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="title">Title A–Z</option>
      </select>
      <span class="filter-status" data-blog-status aria-live="polite"></span>
    </div>

  </div>

{% if filter_tags.size > 0 %}
    <details class="filter-tags" data-blog-tags>
      <summary><i class="fa-solid fa-hashtag fa-sm"></i> Tags</summary>
      <ul class="filter-pills" role="group" aria-label="Filter posts by tag">
        {% for tag in filter_tags %}
          {% assign tagged_posts = site.posts | where: "tags", tag %}
          {% if tagged_posts.size > 0 %}
            <li>
              <a
                class="filter-pill"
                href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}"
                data-filter-type="tag"
                data-filter-value="{{ tag | slugify }}"
              >
                {{ tag }} <span class="filter-count">{{ tagged_posts.size }}</span>
              </a>
            </li>
          {% endif %}
        {% endfor %}
      </ul>
    </details>
{% endif %}
</div>

  <ul class="post-list" data-blog-list>

    {% for post in site.posts %}

    {% if post.external_source == blank %}
      {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
    {% else %}
      {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
    {% endif %}
    {% assign year = post.date | date: "%Y" %}
    {% assign tags = post.tags | join: "" %}
    {% assign categories = post.categories | join: "" %}

    {% comment %} Slugified lists so the filter bar can match on them. {% endcomment %}
    {% assign post_category_slugs = "" %}
    {% for category in post.categories %}
      {% assign category_slug = category | slugify %}
      {% assign post_category_slugs = post_category_slugs | append: category_slug | append: " " %}
    {% endfor %}
    {% assign post_tag_slugs = "" %}
    {% for tag in post.tags %}
      {% assign tag_slug = tag | slugify %}
      {% assign post_tag_slugs = post_tag_slugs | append: tag_slug | append: " " %}
    {% endfor %}

    <li
      data-post
      data-categories="{{ post_category_slugs | strip }}"
      data-tags="{{ post_tag_slugs | strip }}"
      data-date="{{ post.date | date: '%s' }}"
      data-title="{{ post.title | downcase | strip }}"
    >

{% if post.thumbnail %}

<div class="row">
          <div class="col-sm-9">
{% endif %}
        <h3>
        {% if post.redirect == blank %}
          <a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
        {% elsif post.redirect contains '://' %}
          <a class="post-title" href="{{ post.redirect }}" target="_blank">{{ post.title }}</a>
          <svg width="2rem" height="2rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        {% else %}
          <a class="post-title" href="{{ post.redirect | relative_url }}">{{ post.title }}</a>
        {% endif %}
      </h3>
      <p>{{ post.description }}</p>
      <p class="post-meta">
        {{ read_time }} min read &nbsp; &middot; &nbsp;
        {{ post.date | date: '%B %d, %Y' }}
        {% if post.external_source %}
        &nbsp; &middot; &nbsp; {{ post.external_source }}
        {% endif %}
      </p>
      <p class="post-tags">
        <a href="{{ year | prepend: '/blog/' | relative_url }}">
          <i class="fa-solid fa-calendar fa-sm"></i> {{ year }} </a>

          {% if tags != "" %}
          &nbsp; &middot; &nbsp;
            {% for tag in post.tags %}
            <a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}">
              <i class="fa-solid fa-hashtag fa-sm"></i> {{ tag }}</a>
              {% unless forloop.last %}
                &nbsp;
              {% endunless %}
              {% endfor %}
          {% endif %}

          {% if categories != "" %}
          &nbsp; &middot; &nbsp;
            {% for category in post.categories %}
            <a href="{{ category | slugify | prepend: '/blog/category/' | relative_url }}">
              <i class="fa-solid fa-tag fa-sm"></i> {{ category }}</a>
              {% unless forloop.last %}
                &nbsp;
              {% endunless %}
              {% endfor %}
          {% endif %}
    </p>

{% if post.thumbnail %}

</div>

  <div class="col-sm-3">
    <img class="card-img" src="{{ post.thumbnail | relative_url }}" style="object-fit: cover; height: 90%" alt="image">
  </div>
</div>
{% endif %}
    </li>

    {% endfor %}

  </ul>

<p class="blog-empty" data-blog-empty hidden>No posts match that filter yet. <a href="#" data-blog-reset>Show everything</a>.</p>

</div>
