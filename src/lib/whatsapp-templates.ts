/**
 * WHATSAPP TEMPLATES - Single Source of Truth
 *
 * These names MUST exactly match the approved templates in Meta Business Manager.
 * Do NOT change spellings here without first updating them in Meta.
 * Last synced with Meta: 22 Jun 2026
 *
 * Cost reference (India):
 *   Utility   → ~₹0.31 per conversation
 *   Marketing → ~₹0.88 per conversation
 */

export type WhatsAppTemplateName =
  // ─── Utility Templates ───────────────────────────────────────────
  | 'mppsc_pre_mains_ut'   // Pre+Mains Syllabus & PYQ Decoding (Utility)
  | 'mppsc_mains_ut_new'   // Mains Only – Syllabus & PYQ (Utility)
  | 'mppsc_pyq_promo'      // PYQ Promo – Text only (Utility)
  | 'hello_world'          // Meta default test template (Utility)
  // ─── Marketing Templates ─────────────────────────────────────────
  | 'mppsc_toppers_quote'  // Toppers Quote – Mains focus (Marketing)
  | 'mppsc_mains_2025'     // Mains 2025 – General promo (Marketing)
  | 'mppsc_journey_start'  // Journey Start – Onboarding (Marketing)
  | 'zenscroll_alert'      // ZenScroll Alert – Image + body (Marketing)

export type TemplateCategory = 'Utility' | 'Marketing'

export interface WhatsAppTemplate {
  name: WhatsAppTemplateName
  label: string
  category: TemplateCategory
  hasImageHeader?: boolean
}

/**
 * Master list of all approved WhatsApp templates.
 * Order matches the Meta Business Manager dashboard.
 */
export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  // ─── Utility (Low Cost ~₹0.31) ───────────────────────────────────
  {
    name: 'mppsc_pre_mains_ut',
    label: 'MPPSC Pre+Mains Update',
    category: 'Utility',
  },
  {
    name: 'mppsc_mains_ut_new',
    label: 'MPPSC Mains Update',
    category: 'Utility',
  },
  {
    name: 'mppsc_pyq_promo',
    label: 'MPPSC PYQ Promo',
    category: 'Utility',
  },
  {
    name: 'hello_world',
    label: 'Hello World (Test)',
    category: 'Utility',
  },

  // ─── Marketing (~₹0.88) ──────────────────────────────────────────
  {
    name: 'mppsc_toppers_quote',
    label: 'MPPSC Toppers Quote',
    category: 'Marketing',
  },
  {
    name: 'mppsc_mains_2025',
    label: 'MPPSC Mains 2025',
    category: 'Marketing',
  },
  {
    name: 'mppsc_journey_start',
    label: 'MPPSC Journey Start',
    category: 'Marketing',
  },
  {
    name: 'zenscroll_alert',
    label: 'ZenScroll Alert (Image)',
    category: 'Marketing',
    hasImageHeader: true,
  },
]

/** Utility templates only */
export const UTILITY_TEMPLATES = WHATSAPP_TEMPLATES.filter(
  (t) => t.category === 'Utility'
)

/** Marketing templates only */
export const MARKETING_TEMPLATES = WHATSAPP_TEMPLATES.filter(
  (t) => t.category === 'Marketing'
)

/** Quick lookup by name */
export const TEMPLATE_MAP = Object.fromEntries(
  WHATSAPP_TEMPLATES.map((t) => [t.name, t])
) as Record<WhatsAppTemplateName, WhatsAppTemplate>

/** Default template to pre-select in the dashboard */
export const DEFAULT_TEMPLATE: WhatsAppTemplateName = 'mppsc_pre_mains_ut'
