import { FormFieldSchema } from '../FormShell';
import { FIELD_TYPES } from '../../constants/forms';

export const taskFields: FormFieldSchema[] = [
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
];

export const createTaskForm = {
    title: 'יצירת משימה חדשה',
    subtitle: 'הקצה משימה לעובד',
    primaryActionLabel: 'צור משימה',
    fields: taskFields,
};

export const editTaskForm = {
    title: 'עריכת משימה',
    subtitle: 'עדכן את פרטי המשימה',
    primaryActionLabel: 'שמור שינויים',
    fields: taskFields,
};
