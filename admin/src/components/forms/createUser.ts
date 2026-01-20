import { FormFieldSchema } from '../FormShell';

export const createUserForm = {
    title: 'הוספת עובד למערכת',
    subtitle: 'מלא את פרטי העובד החדש',
    primaryActionLabel: 'הוסף עובד',
    fields: [
        {
            id: 'fullName',
            type: 'textBox',
            label: 'שם מלא',
            placeholder: 'הכנס שם מלא',
            required: true,
        },
        {
            id: 'email',
            type: 'textBox',
            label: 'אימייל',
            placeholder: 'employee@company.com',
            required: true,
        },
        {
            id: 'password',
            type: 'passwordBox',
            label: 'סיסמה ראשונית',
            placeholder: 'הזן סיסמה ראשונית (לפחות 6 תווים)',
            required: true,
            maxLength: 50,
        },
        {
            id: 'role',
            type: 'dropdownBox',
            label: 'תפקיד',
            options: [
                { value: 'regular', label: 'עובד' },
                { value: 'admin', label: 'מנהל' },
            ],
            required: true,
        },
        {
            id: 'jobTitle',
            type: 'textBox',
            label: 'תואר תפקיד',
            placeholder: 'לדוגמה: ראש צוות פיתוח',
            dependsOn: {
                fieldId: 'role',
                values: ['admin'],
            },
            collapsible: true,
        }
    ] as FormFieldSchema[],
};
