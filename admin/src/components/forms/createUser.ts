import { FormFieldSchema } from '../FormShell';
import { FIELD_TYPES } from '../../constants/forms';

export const createUserForm = {
    title: 'הוספת עובד למערכת',
    subtitle: 'מלא את פרטי העובד החדש',
    primaryActionLabel: 'הוסף עובד',
    fields: [
        {
            id: 'fullName',
            type: FIELD_TYPES.TEXT_BOX,
            label: 'שם מלא',
            placeholder: 'הכנס שם מלא',
            required: true,
        },
        {
            id: 'email',
            type: FIELD_TYPES.TEXT_BOX,
            label: 'אימייל',
            placeholder: 'employee@company.com',
            required: true,
        },
        {
            id: 'password',
            type: FIELD_TYPES.PASSWORD_BOX,
            label: 'סיסמה ראשונית',
            placeholder: 'הזן סיסמה ראשונית (לפחות 6 תווים)',
            required: true,
            maxLength: 50,
        },
        {
            id: 'role',
            type: FIELD_TYPES.DROPDOWN_BOX,
            label: 'תפקיד',
            options: [
                { value: 'regular', label: 'עובד' },
                { value: 'admin', label: 'מנהל' },
            ],
            required: true,
        },
        {
            id: 'jobTitle',
            type: FIELD_TYPES.TEXT_BOX,
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
