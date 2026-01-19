# Tasks

## Phase 1: Foundation & Types

- [x] 1.1 Create directory structure: `admin/src/components/FormShell/` with `fields/` subdirectory
- [x] 1.2 Define `types.ts` with:
  - [x] 1.2.1 `FormFieldType` union type
  - [x] 1.2.2 `FieldDependency` interface
  - [x] 1.2.3 `FormFieldSchema` interface (including `dependsOn`, `collapsible`)
  - [x] 1.2.4 `FormShellProps` interface

## Phase 2: Field Components

- [x] 2.1 Implement `TextBox` component:
  - [x] 2.1.1 Label, input, placeholder support
  - [x] 2.1.2 Error message display
  - [x] 2.1.3 onChange handler
- [x] 2.2 Implement `LargeTextBox` component (textarea variant)
- [x] 2.3 Implement `DropdownBox` component:
  - [x] 2.3.1 Options rendering
  - [x] 2.3.2 Selection handling
  - [x] 2.3.3 Placeholder support
- [x] 2.4 Implement `DateBox` component:
  - [x] 2.4.1 Custom calendar picker popup UI
  - [x] 2.4.2 Date selection and formatting
- [x] 2.5 Implement `DateRangeBox` component:
  - [x] 2.5.1 Start and end date inputs with shared calendar picker
  - [x] 2.5.2 Cross-field validation (end >= start)
  - [x] 2.5.3 Return combined `{ start, end }` value

## Phase 3: Layout Components

- [x] 3.1 Create `FormHeader`:
  - [x] 3.1.1 Title and subtitle display
  - [x] 3.1.2 Close button (X) with onClose callback
- [x] 3.2 Create `FormFooter` with `PrimaryActionButton`:
  - [x] 3.2.1 Submit button with label and icon
  - [x] 3.2.2 Disabled state during submission

## Phase 4: Conditional Fields & Collapsible Sections

- [x] 4.1 Implement `CollapsibleSection` wrapper:
  - [x] 4.1.1 Expand/collapse toggle button
  - [x] 4.1.2 Smooth expand/collapse animation
  - [x] 4.1.3 `defaultCollapsed` support
- [x] 4.2 Implement `dependsOn` visibility logic:
  - [x] 4.2.1 Evaluate parent field value against allowed values
  - [x] 4.2.2 Show/hide dependent fields with animation
  - [x] 4.2.3 Clear hidden field values

## Phase 5: FormShell Container

- [x] 5.1 Implement modal overlay and backdrop:
  - [x] 5.1.1 Centered positioning
  - [x] 5.1.2 Backdrop click to close
  - [x] 5.1.3 Escape key to close
- [x] 5.2 Implement schema-driven field rendering loop
- [x] 5.3 Implement internal state management for field values
- [x] 5.4 Implement validation logic:
  - [x] 5.4.1 Required field validation
  - [x] 5.4.2 Error state per field
  - [x] 5.4.3 Block submission on validation errors
- [x] 5.5 Implement focus trap for accessibility

## Phase 6: Styling

- [x] 6.1 Create `FormShell.css`:
  - [x] 6.1.1 Modal container (centered, rounded corners, shadow)
  - [x] 6.1.2 Backdrop overlay
  - [x] 6.1.3 Header and footer layout
- [x] 6.2 Create `FormFields.css`:
  - [x] 6.2.1 Input field styling (matching design system)
  - [x] 6.2.2 Error message styling
  - [x] 6.2.3 Collapsible section animations

## Phase 7: Integration & Testing

- [x] 7.1 Create barrel export in `index.ts`
- [x] 7.2 Add unit tests:
  - [x] 7.2.1 FormShell rendering test
  - [x] 7.2.2 Field validation test
  - [x] 7.2.3 Conditional visibility test
- [x] 7.3 Verify build passes with `npm run build`

