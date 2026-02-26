// composables/useRequestTypeLabels.ts

import { REQUEST_TYPE_LABELS, getRequestTypeLabel } from '~/config/requestTypeLabels'

/**
 * Composable for accessing request type display labels.
 * Provides reactive access to the label mappings and a helper function.
 */
export const useRequestTypeLabels = () => {
  return {
    labels: REQUEST_TYPE_LABELS,
    getLabel: getRequestTypeLabel,
  }
}
