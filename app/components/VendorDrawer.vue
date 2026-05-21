<script setup lang="ts">
import type { Vendor, DpaRecord, EdtechRecord } from '#shared/types/data'
import { DPA_STATUS_COLORS, RISK_LABEL_COLORS, EDTECH_STATUS_COLORS } from '#shared/utils/riskLabels'

const props = defineProps<{ vendor: Vendor | null }>()
const open = defineModel<boolean>('open', { default: false })

// DPA + 1EdTech sub-fetches. useFetch dedups by URL key so opening the drawer
// across many vendor selections re-uses the cached payload (research Pitfall #11).
// `default: () => []` promotes the ref to non-null Phase 9 pattern; required so
// `.value.map(...)` reads below don't need null guards.
const { data: dpaList } = await useFetch('/api/dpa', { default: () => [] })
const { data: edtechList } = await useFetch('/api/edtech', { default: () => [] })

// Deviation (Rule 3 - Blocking, carry-forward from 10-01 lesson #1):
// Plan interface snippet used `.map((d) => ...)` without type annotation.
// TS strict mode (Nuxt 4 default) flags TS7006 implicit any. Annotate
// callback params explicitly with the DpaRecord / EdtechRecord types.
const dpaMap = computed<Record<string, DpaRecord>>(() =>
  Object.fromEntries(dpaList.value.map((d: DpaRecord) => [d.vendorId, d]))
)
const edtechMap = computed<Record<string, EdtechRecord>>(() =>
  Object.fromEntries(edtechList.value.map((e: EdtechRecord) => [e.vendorId, e]))
)

const vendorDpa = computed<DpaRecord | null>(() =>
  props.vendor ? dpaMap.value[props.vendor.vendorId] ?? null : null
)
const vendorEdtech = computed<EdtechRecord | null>(() =>
  props.vendor ? edtechMap.value[props.vendor.vendorId] ?? null : null
)

const totalPrivacyScore = computed(() =>
  props.vendor
    ? Object.values(props.vendor.privacyScore).reduce((sum: number, v: number) => sum + v, 0)
    : 0
)

// Radar axes — 10 entries verbatim from v0.5.0 src/components/VendorDrawer.vue
// (research §5, table of axis labels). Order MUST match the value array below.
const RADAR_AXES = [
  { name: 'Information Collected', max: 10 },
  { name: 'Use of Information', max: 10 },
  { name: 'Data Sharing', max: 10 },
  { name: 'Security Measures', max: 10 },
  { name: 'User Rights', max: 10 },
  { name: 'Retention Period', max: 10 },
  { name: 'Compliance with Laws', max: 10 },
  { name: 'Updates to Privacy Policy', max: 10 },
  { name: 'Overall Clarity and Transparency', max: 10 },
  { name: 'Contact Information', max: 10 },
]

const radarOption = computed(() => {
  if (!props.vendor) return {}
  const s = props.vendor.privacyScore
  return {
    radar: { indicator: RADAR_AXES },
    series: [{
      type: 'radar',
      data: [{
        value: [
          s.informationCollected, s.useOfInformation, s.dataSharing,
          s.securityMeasures, s.userRights, s.retentionPeriod,
          s.complianceWithLaws, s.updatesToPolicy,
          s.clarityAndTransparency, s.contactInformation,
        ],
        areaStyle: { color: 'rgba(72, 76, 230, 0.15)' },
        lineStyle: { color: '#484ce6', width: 2 },
      }],
    }],
    tooltip: { trigger: 'item' },
  }
})
</script>

<template>
  <USlideover
    v-model:open="open"
    :title="vendor?.name ?? ''"
    :description="vendor?.category ?? ''"
    side="right"
    :ui="{ content: 'w-[480px] sm:max-w-[480px]' }"
  >
    <template #body>
      <div v-if="vendor" class="flex flex-col gap-6 p-4">
        <!-- Usage section -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Usage</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">Frequency</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendor.frequency }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Last Seen</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendor.lastSeen }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Users</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendor.userCount.toLocaleString() }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Students</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendor.studentCount.toLocaleString() }}</div>
            </div>
          </div>
        </section>

        <USeparator />

        <!-- DPA section -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">DPA</h3>
          <div v-if="vendorDpa" class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="text-sm text-gray-500 w-24">Status</div>
              <UBadge
                :label="vendorDpa.status"
                color="neutral"
                variant="solid"
                :style="{ backgroundColor: DPA_STATUS_COLORS[vendorDpa.status], color: '#ffffff' }"
              />
            </div>
            <div class="flex items-center gap-3">
              <div class="text-sm text-gray-500 w-24">Signed Date</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendorDpa.signedDate ?? '—' }}</div>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-sm text-gray-500 w-24">Expiry Date</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendorDpa.expiryDate ?? '—' }}</div>
            </div>
            <div v-if="vendorDpa.riskLabel" class="flex items-center gap-3">
              <div class="text-sm text-gray-500 w-24">Risk Label</div>
              <UBadge
                :label="vendorDpa.riskLabel"
                color="neutral"
                variant="solid"
                :style="{ backgroundColor: RISK_LABEL_COLORS[vendorDpa.riskLabel], color: '#ffffff' }"
              />
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">No DPA record on file.</div>
        </section>

        <USeparator />

        <!-- 1EdTech section -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">1EdTech Certification</h3>
          <div v-if="vendorEdtech" class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="text-sm text-gray-500 w-24">Status</div>
              <UBadge
                :label="vendorEdtech.certificationStatus"
                color="neutral"
                variant="solid"
                :style="{ backgroundColor: EDTECH_STATUS_COLORS[vendorEdtech.certificationStatus], color: '#ffffff' }"
              />
            </div>
            <div v-if="vendorEdtech.certificationStandard" class="flex items-center gap-3">
              <div class="text-sm text-gray-500 w-24">Standard</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendorEdtech.certificationStandard }}</div>
            </div>
            <div v-if="vendorEdtech.certifiedDate" class="flex items-center gap-3">
              <div class="text-sm text-gray-500 w-24">Certified Date</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendorEdtech.certifiedDate }}</div>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">No 1EdTech record on file.</div>
        </section>

        <USeparator />

        <!-- Privacy radar -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-2">Privacy Policy Score</h3>
          <div class="flex items-baseline gap-2 mb-4">
            <span class="text-2xl font-semibold text-primary-600">{{ totalPrivacyScore }}</span>
            <span class="text-sm text-gray-500">Total Score / 100</span>
          </div>
          <!--
            ClientOnly + VChart + USkeleton fallback (research §5).
            The drawer is interaction-mounted (never part of initial SSR),
            so ClientOnly is safe AND matches ROADMAP SC#2 verbatim wording.
            Phase 7 "no double-wrap" pitfall does NOT apply here.
          -->
          <ClientOnly>
            <VChart :option="radarOption" autoresize style="height: 320px; width: 100%" />
            <template #fallback>
              <USkeleton class="h-[320px] w-full" />
            </template>
          </ClientOnly>
        </section>

        <!-- Tags section reserved for Plan 10-03 — do NOT add USelectMenu here in Plan 10-02 -->
      </div>
    </template>
  </USlideover>
</template>
