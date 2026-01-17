import { FormFieldSchema } from '../FormShell';

export const createClientForm = {
    title: 'טופס יצירת לקוח',
    subtitle: 'פה תוכל להוסיף לקוחות למערכת',
    primaryActionLabel: 'צור לקוח',
    fields: [
        {
            id: 'clientName',
            type: 'textBox',
            label: 'שם הלקוח',
            placeholder: 'הכנס את שם הלקוח',
            required: true,
        },
        {
            id: 'contactDetails',
            type: 'largeTextBox',
            label: 'פרטי איש קשר',
            placeholder: 'הכנס פרטים מלאים',
        },
    ] satisfies FormFieldSchema[],
};
