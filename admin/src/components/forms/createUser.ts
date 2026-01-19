import { FormFieldSchema } from '../FormShell';

export const userFieldsCreate: FormFieldSchema[] = [
    {
        id: 'full_name',
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
        id: 'jobTitle', // mockUser has 'job_title'
        type: 'textBox',
        label: 'תואר תפקיד',
        placeholder: 'לדוגמה: ראש צוות פיתוח',
    }
];


export const userFieldsEdit: FormFieldSchema[] = [
    {
        id: 'full_name',
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
        id: 'jobTitle', // mockUser has 'job_title'
        type: 'textBox',
        label: 'תואר תפקיד',
        placeholder: 'לדוגמה: ראש צוות פיתוח',
    }
];

export const createUserForm = {
    title: 'הוספת עובד למערכת',
    subtitle: 'מלא את פרטי העובד החדש',
    primaryActionLabel: 'הוסף עובד',
    fields: userFieldsCreate,
};

export const editUserForm = {
    title: 'עריכת פרטי עובד',
    subtitle: 'עדכן את פרטי העובד',
    primaryActionLabel: 'שמור שינויים',
    fields: userFieldsEdit,
};
