import { FormFieldSchema } from '../FormShell';

export const createTaskForm = {
    title: 'יצירת משימה חדשה',
    subtitle: 'הקצה משימה לעובד',
    primaryActionLabel: 'צור משימה',
    fields: [
        {
            id: 'taskTitle',
            type: 'textBox',
            label: 'כותרת המשימה',
            placeholder: 'מה צריך לעשות?',
            required: true,
        },
        {
            id: 'projectId',
            type: 'dropdownBox',
            label: 'פרויקט משוייך',
            placeholder: 'בחר פרויקט',
            options: [
                { value: 'p1', label: 'פיתוח אתר אינטרנט' },
                { value: 'p2', label: 'תחזוקת שרתים' },
            ],
            required: true,
        },
        {
            id: 'assignedTo',
            type: 'dropdownBox',
            label: 'מוקצה ל:',
            placeholder: 'בחר עובד',
            options: [
                { value: 'u1', label: 'ישראל ישראלי' },
                { value: 'u2', label: 'דני דין' },
            ],
            required: true,
        },
        {
            id: 'dueDate',
            type: 'dateBox',
            label: 'תאריך יעד',
            required: true,
        },
        {
            id: 'description',
            type: 'largeTextBox',
            label: 'תיאור המשימה',
            placeholder: 'הוראות ביצוע...',
            rows: 4,
        },
    ] satisfies FormFieldSchema[],
};
