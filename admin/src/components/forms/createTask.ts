import { FormFieldSchema } from '../FormShell';
import { FIELD_TYPES } from '../../constants/forms';

export const createTaskForm = {
    title: 'יצירת משימה חדשה',
    subtitle: 'הקצה משימה לעובד',
    primaryActionLabel: 'צור משימה',
    fields: [
        {
            id: 'taskTitle',
            type: FIELD_TYPES.TEXT_BOX,
            label: 'כותרת המשימה',
            placeholder: 'מה צריך לעשות?',
            required: true,
        },
        {
            id: 'projectId',
            type: FIELD_TYPES.DROPDOWN_BOX,
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
            type: FIELD_TYPES.DROPDOWN_BOX,
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
            type: FIELD_TYPES.DATE_BOX,
            label: 'תאריך יעד',
            required: true,
        },
        {
            id: 'description',
            type: FIELD_TYPES.LARGE_TEXT_BOX,
            label: 'תיאור המשימה',
            placeholder: 'הוראות ביצוע...',
            rows: 4,
        },
    ] satisfies FormFieldSchema[],
};
