# Request Type Labels Configuration

This document describes how request type labels are configured and how to add new types.

## Overview

Request types are stored in the database as short code strings (e.g., `general`, `ocpv`, `engineering`). These codes are mapped to user-friendly display labels shown in the "Type" column on the Requests and Archive pages.

## Current Mappings

| Database Value | Display Label   |
|----------------|-----------------|
| `general`      | General         |
| `ocpv`         | Virtualization  |
| `engineering`  | Supported       |
| `nvidia`       | Nvidia          |
| `rosa`         | Managed         |
| `rhoai`        | OpenShift AI    |

## Configuration Location

The mappings are stored in a TypeScript configuration file:

```
app/config/requestTypeLabels.ts
```

This file exports:
- `REQUEST_TYPE_LABELS`: A record mapping database values to display labels
- `getRequestTypeLabel()`: A helper function that returns the display label for a given type

## Adding a New Request Type

To add a new request type:

1. Open `app/config/requestTypeLabels.ts`
2. Add a new entry to the `REQUEST_TYPE_LABELS` object:

```typescript
export const REQUEST_TYPE_LABELS: Record<string, string> = {
  general: 'General',
  ocpv: 'Virtualization',
  engineering: 'Supported',
  nvidia: 'Nvidia',
  rosa: 'Managed',
  rhoai: 'OpenShift AI',
  // Add your new type here:
  new_type: 'New Type Label',
}
```

3. Submit a PR with the change

## Graceful Fallback

If a request has a `request_type` value that doesn't exist in the mapping, the system will display the raw database value. This ensures the UI doesn't break if new types are added to the database before the mapping is updated.

## Usage in Components

The labels are accessed through the `useRequestTypeLabels` composable:

```vue
<script setup lang="ts">
const { getLabel } = useRequestTypeLabels()
</script>

<template>
  <span>{{ getLabel(request.requestType) }}</span>
</template>
```

## Why Not Store in the Database?

The mapping is stored in code (not the database) because:

1. **Simplicity**: No database migration needed to add/change labels
2. **PR-based workflow**: Changes go through code review
3. **Deployment flexibility**: Labels can be updated without database access
4. **No persistence overhead**: Labels are display-only, not business data
