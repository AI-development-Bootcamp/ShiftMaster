import { FormFieldSchema } from '../FormShell';
import { FIELD_TYPES } from '../../constants/forms';

export const clientFields: FormFieldSchema[] = [
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
];

export const createClientForm = {
    title: 'טופס יצירת לקוח',
    subtitle: 'פה תוכל להוסיף לקוחות למערכת',
    primaryActionLabel: 'צור לקוח',
    fields: clientFields,
};

export const editClientForm = {
    title: 'עריכת פרטי לקוח',
    subtitle: 'עדכן את פרטי הלקוח',
    primaryActionLabel: 'שמור שינויים',
    fields: clientFields,
};
