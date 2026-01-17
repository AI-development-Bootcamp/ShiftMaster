# ConfirmActionModal Component

`ConfirmActionModal` is a reusable modal component for confirming user actions. It supports multiple visual variants (danger, primary, warning, info) and is designed to be accessible and easy to implement.

## Usage

### 1. Import necessary components and constants

```typescript
import { useState } from 'react';
import { ConfirmActionModal } from './ConfirmActionModal'; // Modify path as needed
import { ConfirmVariant } from './types'; // or './confirmActionTypes'
import { CONFIRM_VARIANTS } from '../../constants/ui'; // Modify path as needed
```

### 2. Set up state

You need state to control the modal's visibility and content.

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
```

### 3. Implement the component

```tsx
<ConfirmActionModal
    isOpen={isModalOpen}
    title="Are you sure?"
    description="This action cannot be undone."
    variant={CONFIRM_VARIANTS.DANGER}
    confirmLabel="Delete"
    onConfirm={handleConfirm}
    onCancel={() => setIsModalOpen(false)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | **Required** | Controls visibility |
| `title` | `string` | **Required** | The modal title |
| `description` | `string` | - | Optional descriptive text |
| `variant` | `ConfirmVariant` | `'primary'` | Visual style: `'danger'`, `'primary'`, `'warning'`, `'info'` |
| `confirmLabel` | `string` | **Required** | Text for the confirm button |
| `cancelLabel` | `string` | `'ביטול'` | Text for the cancel button |
| `onConfirm` | `() => void` | **Required** | Function called on confirmation |
| `onCancel` | `() => void` | **Required** | Function called on cancellation |
| `isLoading` | `boolean` | `false` | Shows loading state on confirm button |

## Examples

### Danger Modal (Delete)
```tsx
<ConfirmActionModal
    isOpen={isOpen}
    title="Delete Item"
    description="Are you sure you want to delete this item?"
    variant={CONFIRM_VARIANTS.DANGER}
    confirmLabel="Delete"
    onConfirm={handleDelete}
    onCancel={closeModal}
/>
```

### Info Modal
```tsx
<ConfirmActionModal
    isOpen={isOpen}
    title="Notice"
    description="This is an informational message."
    variant={CONFIRM_VARIANTS.INFO}
    confirmLabel="OK"
    onConfirm={closeModal}
    onCancel={closeModal}
/>
```
