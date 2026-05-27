export const PERSISTENCE = {
  // Prevent double hydration and flicker.
  hydrationMarkerKey: 'hydration_marker' as const,
  operationalPrefsKey: 'operational_prefs' as const,
} as const;

