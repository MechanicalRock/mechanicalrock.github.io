---
layout: page
title: Tags
permalink: /tags/
---
<p>
{% assign sorted_tags = site.tags | sort %}
{% for tag in sorted_tags %}
  {% assign t = tag | first %}
  <a style="background: #F6F6F6" href="/tags/#{{ t }}">{{ t }}</a>
{% endfor %}
</p>
{% for tag in sorted_tags %}
  {% assign t = tag | first %}
  {% assign posts = tag | last %}

  <p><a name="{{ t }}"></a><a href="/tags/#{{ t }}">{{ t }}</a></p>
  <ul>
  {% for post in posts %}
    {% if post.tags contains t %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      <span>{{ post.date | date: "%B %-d, %Y"  }}</span>
    </li>
    {% endif %}
  {% endfor %}
  </ul>
{% endfor %}
