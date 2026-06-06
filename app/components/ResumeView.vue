<script setup lang="ts">
import type { ResumeContent } from '~/data/resume'

defineProps<{
  content: ResumeContent
}>()
</script>

<template>
  <article class="resume">
    <header class="resume-header">
      <h1 class="resume-name">
        {{ content.name }}
      </h1>
      <p class="resume-title">
        {{ content.title }} · {{ content.location }}
      </p>
      <ul class="resume-contact">
        <li
          v-for="item in content.contact"
          :key="item.label"
          class="resume-contact-item"
        >
          <span class="resume-contact-label">{{ item.label }}</span>
          <a
            v-if="item.href"
            :href="item.href"
            class="resume-contact-value resume-link"
            target="_blank"
            rel="noopener noreferrer"
          >{{ item.value }}</a>
          <span v-else class="resume-contact-value">{{ item.value }}</span>
        </li>
      </ul>
    </header>

    <section class="resume-section">
      <h2 class="resume-section-title">
        {{ content.sections.experience }}
      </h2>
      <div
        v-for="job in content.experience"
        :key="`${job.company}-${job.period}`"
        class="resume-entry"
      >
        <div class="resume-entry-head">
          <div>
            <h3 class="resume-entry-title">
              {{ job.role }}
            </h3>
            <p class="resume-entry-subtitle">
              {{ job.company }} · {{ job.location }}
            </p>
          </div>
          <time class="resume-entry-period">{{ job.period }}</time>
        </div>
        <ul class="resume-list">
          <li
            v-for="(highlight, index) in job.highlights"
            :key="index"
          >
            {{ highlight }}
          </li>
        </ul>
      </div>
    </section>

    <section class="resume-section">
      <h2 class="resume-section-title">
        {{ content.sections.skills }}
      </h2>
      <div
        v-for="group in content.skills"
        :key="group.title"
        class="resume-skill-group"
      >
        <h3 class="resume-skill-title">
          {{ group.title }}
        </h3>
        <ul class="resume-list">
          <li
            v-for="(item, index) in group.items"
            :key="index"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </section>

    <section class="resume-section">
      <h2 class="resume-section-title">
        {{ content.sections.education }}
      </h2>
      <div
        v-for="edu in content.education"
        :key="edu.school"
        class="resume-entry"
      >
        <div class="resume-entry-head">
          <div>
            <h3 class="resume-entry-title">
              {{ edu.degree }} · {{ edu.major }}
            </h3>
            <p class="resume-entry-subtitle">
              {{ edu.school }}
            </p>
          </div>
          <time class="resume-entry-period">{{ edu.period }}</time>
        </div>
      </div>
    </section>

    <section class="resume-section">
      <h2 class="resume-section-title">
        {{ content.sections.projects }}
      </h2>
      <div
        v-for="project in content.projects"
        :key="project.name"
        class="resume-entry"
      >
        <div class="resume-entry-head">
          <div>
            <h3 class="resume-entry-title">
              <a
                v-if="project.url"
                :href="project.url"
                class="resume-link"
                target="_blank"
                rel="noopener noreferrer"
              >{{ project.name }}</a>
              <span v-else>{{ project.name }}</span>
            </h3>
          </div>
          <time class="resume-entry-period">{{ project.period }}</time>
        </div>
        <p class="resume-paragraph">
          {{ project.intro }}
        </p>
        <p v-if="project.tech" class="resume-tech">
          {{ project.tech }}
        </p>
        <ul class="resume-list">
          <li
            v-for="(highlight, index) in project.highlights"
            :key="index"
          >
            {{ highlight }}
          </li>
        </ul>
      </div>
    </section>

    <section class="resume-section">
      <h2 class="resume-section-title">
        {{ content.sections.languages }}
      </h2>
      <ul class="resume-inline-list">
        <li
          v-for="lang in content.languages"
          :key="lang"
        >
          {{ lang }}
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.resume {
  color: #1c1917;
  font-size: 0.875rem;
  line-height: 1.55;
}

.resume-header {
  margin-bottom: 1.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid #1c1917;
}

.resume-name {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.resume-title {
  margin-top: 0.35rem;
  font-size: 1rem;
  color: #57534e;
}

.resume-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin-top: 0.85rem;
  list-style: none;
  padding: 0;
}

.resume-contact-item {
  display: flex;
  gap: 0.35rem;
}

.resume-contact-label {
  color: #78716c;
}

.resume-contact-value {
  color: #1c1917;
}

.resume-link {
  color: #1c1917;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.resume-link:hover {
  color: #b45309;
}

.resume-section + .resume-section {
  margin-top: 1.5rem;
}

.resume-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #b45309;
  margin-bottom: 0.85rem;
}

.resume-entry + .resume-entry,
.resume-skill-group + .resume-skill-group {
  margin-top: 1rem;
}

.resume-entry-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.35rem;
}

.resume-entry-title {
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.35;
}

.resume-entry-subtitle {
  margin-top: 0.15rem;
  color: #57534e;
  font-size: 0.82rem;
}

.resume-entry-period {
  flex-shrink: 0;
  font-size: 0.78rem;
  color: #78716c;
  white-space: nowrap;
}

.resume-skill-title {
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.resume-paragraph {
  margin: 0.35rem 0;
  color: #44403c;
}

.resume-tech {
  margin: 0.35rem 0 0.5rem;
  font-size: 0.8rem;
  color: #78716c;
}

.resume-list {
  margin: 0;
  padding-left: 1.1rem;
}

.resume-list li + li {
  margin-top: 0.3rem;
}

.resume-inline-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

@media print {
  .resume-header {
    border-bottom-color: #000;
  }

  .resume-link {
    color: #000;
    text-decoration: none;
  }
}
</style>
