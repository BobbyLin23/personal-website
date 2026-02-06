<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'

useSeoMeta({
  title: 'Weekly',
  description: 'A weekly journal of my learnings, discoveries, and reflections.',
})

const { data: weeklies } = await useAsyncData('all-weeklies', () =>
  queryCollection('weekly')
    .select('date', 'path')
    .order('date', 'DESC')
    .all())

// Calendar state
const todayDate = today(getLocalTimeZone())
const placeholder = ref(new CalendarDate(todayDate.year, todayDate.month, todayDate.day)) as Ref<DateValue>
const selectedDate = ref<DateValue>()
const pickerOpen = ref(false)

// Build date -> path lookup map from weekly posts
const weeklyDateMap = computed(() => {
  const map = new Map<string, string>()
  if (weeklies.value) {
    for (const w of weeklies.value) {
      const d = new Date(w.date)
      map.set(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, w.path)
    }
  }
  return map
})

function dateKey(day: DateValue): string {
  return `${day.year}-${day.month}-${day.day}`
}

function hasWeekly(day: DateValue): boolean {
  return weeklyDateMap.value.has(dateKey(day))
}

// Navigate to weekly detail when a highlighted date is clicked
function onDaySelect(date: any) {
  if (!date || !date.year)
    return
  const path = weeklyDateMap.value.get(dateKey(date as DateValue))
  if (path) {
    navigateTo(path)
  }
}

// Date picker: jump to selected month
function onPickerSelect(date: any) {
  if (!date || !date.year)
    return
  placeholder.value = new CalendarDate(date.year, date.month, 1)
  pickerOpen.value = false
}
</script>

<template>
  <UContainer class="py-10 sm:py-16">
    <!-- Page Header -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5 }"
    >
      <div class="mb-12">
        <h1 class="text-3xl font-bold tracking-tight mb-3">
          Weekly
        </h1>
        <p class="text-muted">
          A weekly journal of my learnings, discoveries, and reflections.
        </p>
      </div>
    </Motion>

    <!-- Calendar Section -->
    <Motion
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, delay: 0.1 }"
    >
      <div class="rounded-xl ring ring-default bg-default p-4 sm:p-6">
        <UCalendar
          v-model="selectedDate"
          v-model:placeholder="placeholder"
          :fixed-weeks="true"
          :week-starts-on="0"
          color="primary"
          size="xl"
          :is-date-highlightable="hasWeekly"
          :ui="{
            root: 'w-full',
            header: 'mb-2',
            heading: 'text-lg',
            body: 'pt-2',
            grid: 'w-full',
            gridRow: 'w-full',
            gridWeekDaysRow: 'w-full mb-2',
            gridBody: 'w-full',
            headCell: 'py-2 text-sm',
            cell: 'text-base',
            cellTrigger: '!size-12 sm:!size-14 text-sm sm:text-base data-today:not-data-[selected]:ring-2 data-today:not-data-[selected]:ring-primary cursor-default data-[highlighted]:cursor-pointer',
          }"
          @update:model-value="onDaySelect"
        >
          <!-- Clickable heading for date picker -->
          <template #heading="{ value }">
            <UPopover v-model:open="pickerOpen">
              <UButton
                :label="value"
                variant="ghost"
                color="neutral"
                size="md"
                trailing-icon="i-lucide-chevron-down"
                class="font-semibold text-lg"
              />
              <template #content>
                <div class="p-2">
                  <UCalendar
                    :model-value="(placeholder as CalendarDate)"
                    :month-controls="true"
                    :year-controls="true"
                    color="primary"
                    size="sm"
                    @update:model-value="onPickerSelect"
                  />
                </div>
              </template>
            </UPopover>
          </template>

          <!-- Custom day cell with dot indicator -->
          <template #day="{ day }">
            {{ day.day }}
            <span
              v-if="hasWeekly(day)"
              class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"
            />
          </template>
        </UCalendar>

        <!-- Legend -->
        <div class="flex items-center gap-6 mt-4 pt-4 border-t border-default">
          <div class="flex items-center gap-2 text-xs text-muted">
            <span class="w-2 h-2 rounded-full bg-primary" />
            Has weekly report
          </div>
          <div class="flex items-center gap-2 text-xs text-muted">
            <span class="w-5 h-5 rounded ring-2 ring-primary flex items-center justify-center text-[10px] font-semibold text-primary">
              {{ todayDate.day }}
            </span>
            Today
          </div>
        </div>
      </div>
    </Motion>
  </UContainer>
</template>
