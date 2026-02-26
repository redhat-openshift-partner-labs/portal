/**
 * Request Type Display Labels
 *
 * Maps internal request_type values from the database to user-friendly display labels.
 * These labels are shown in the "Type" column on the Requests and Archive pages.
 *
 * To add a new request type:
 * 1. Add the mapping below with the database value as key and display label as value
 * 2. Submit a PR with the change
 *
 * Example:
 *   'new_type': 'New Type Label',
 */
export const REQUEST_TYPE_LABELS: Record<string, string> = {
  general: 'General',
  ocpv: 'Virtualization',
  engineering: 'Supported',
  nvidia: 'Nvidia',
  rosa: 'Managed',
  rhoai: 'OpenShift AI',
}

/**
 * Get the display label for a request type.
 * Returns the type value itself if no mapping exists (graceful fallback).
 */
export function getRequestTypeLabel(requestType: string): string {
  return REQUEST_TYPE_LABELS[requestType] ?? requestType
}
