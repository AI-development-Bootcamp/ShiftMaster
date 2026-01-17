import { FormFieldSchema } from '../FormShell';
import { FIELD_TYPES } from '../../constants/forms';

export const createClientForm = {
    title: 'טופס יצירת לקוח',
    subtitle: 'פה תוכל להוסיף לקוחות למערכת',
    primaryActionLabel: 'צור לקוח',
    fields: [
        {
            id: 'clientName',
            type: FIELD_TYPES.TEXT_BOX,
            label: 'שם הלקוח',
            placeholder: 'הכנס את שם הלקוח',
            required: true,
        },
        {
            id: 'contactDetails',
            type: FIELD_TYPES.LARGE_TEXT_BOX,
            label: 'פרטי איש קשר',
            placeholder: 'הכנס פרטים מלאים',
        },
    ] satisfies FormFieldSchema[],
};
