# FormShell Documentation

`FormShell` is a schema-driven form builder for the admin panel. It allows you to create consistent, responsive, and accessible forms by defining a simple configuration object (schema) instead of writing repetitive JSX.

## 🚀 Quick Start

1. Create a schema file in `admin/src/components/forms/` (e.g., `createContact.ts`).
2. Define your form structure using `FormFieldSchema[]`.
3. Import and use `<FormShell {...schema} />` in your page.

---

## 🛠 Supported Field Types

| Type | Description |
| :--- | :--- |
| `textBox` | Single-line text input. |
| `passwordBox` | Password input (masked characters). |
| `largeTextBox` | Multi-line textarea. Supports `rows` prop. |
| `dropdownBox` | Select dropdown. Requires `options` array. |
| `dateBox` | Single date picker (Hebrew, RTL). |
| `dateRangeBox` | Date range picker (start & end). |

---

## 📝 Schema Reference

Each field in the `fields` array supports the following properties:

```typescript
interface FormFieldSchema {
  id: string;               // Unique key for the field value
  type: FormFieldType;      // One of the types listed above
  label: string;            // Display label
  placeholder?: string;     // Input placeholder text
  required?: boolean;       // Is the field mandatory?
  maxLength?: number;       // Max characters for text inputs
  
  // Specific to dropdownBox
  options?: { value: string; label: string }[];
  
  // Specific to largeTextBox
  rows?: number;

  // Conditional Visibility
  dependsOn?: {
    fieldId: string;        // ID of the parent field to watch
    values: string[];       // Show this field if parent has one of these values
  };
  
  collapsible?: boolean;    // Wrap in a collapsible section with animation?
  defaultCollapsed?: boolean; // Start collapsed?
}
```

---

## 💡 Examples

### Basic Text Field
```typescript
{
  id: 'fullName',
  type: 'textBox',
  label: 'Full Name',
  required: true
}
```

### Dropdown
```typescript
{
  id: 'role',
  type: 'dropdownBox',
  label: 'Role',
  options: [
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'User' }
  ]
}
```

### Conditional Field (Advanced)
Show a "Job Title" field only when "Role" is "Admin".

```typescript
{
  id: 'jobTitle',
  type: 'textBox',
  label: 'Job Title',
  dependsOn: {
    fieldId: 'role',
    values: ['admin']
  },
  collapsible: true // Adds slide animation
}
```

### Date Range
```typescript
{
  id: 'projectDates',
  type: 'dateRangeBox',
  label: 'Project Duration',
  required: true
}
```

---

## 💻 Usage in Component

```tsx
import { FormShell } from '../components/FormShell';
import { createUserForm } from '../forms'; // Import your schema

function MyPage() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (values) => {
    console.log(values); // { fullName: "...", role: "..." }
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Form</button>
      
      {isOpen && (
        <FormShell 
          {...createUserForm} 
          onSubmit={handleSubmit}
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
```
