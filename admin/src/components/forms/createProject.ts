import { FormFieldSchema } from '../FormShell';


export const projectFields: FormFieldSchema[] = [
    {
        id: 'projectName',
        type: 'textBox',
        label: 'שם הפרויקט',
        placeholder: 'הכנס את שם הפרויקט',
        required: true,
    },
    {
        id: 'clientId',
        type: 'dropdownBox',
        label: 'לקוח',
        placeholder: 'בחר לקוח',
        options: [
            { value: '1', label: 'לקוח דמו 1' },
            { value: '2', label: 'לקוח דמו 2' },
        ],
        required: true,
    },
    {
        id: 'projectDuration',
        type: 'dateRangeBox',
        label: 'תקופת הפרויקט',
        required: true,
    },
    {
        id: 'description',
        type: 'largeTextBox',
        label: 'תיאור הפרויקט',
        placeholder: 'פרטים נוספים אודות הפרויקט',
        rows: 3,
    },
];

export const createProjectForm = {
    title: 'הוספת פרויקט חדש',
    subtitle: 'הגדר את פרטי הפרויקט',
    primaryActionLabel: 'צור פרויקט',
    fields: projectFields,
};

export const editProjectForm = {
    title: 'עריכת פרויקט',
    subtitle: 'עדכן את פרטי הפרויקט',
    primaryActionLabel: 'שמור שינויים',
    fields: projectFields,
};
