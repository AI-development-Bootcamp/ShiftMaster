import { FormFieldSchema } from '../FormShell';
import { FIELD_TYPES } from '../../constants/forms';

export const createProjectForm = {
    title: 'הוספת פרויקט חדש',
    subtitle: 'הגדר את פרטי הפרויקט',
    primaryActionLabel: 'צור פרויקט',
    fields: [
        {
            id: 'projectName',
            type: FIELD_TYPES.TEXT_BOX,
            label: 'שם הפרויקט',
            placeholder: 'הכנס את שם הפרויקט',
            required: true,
        },
        {
            id: 'clientId',
            type: FIELD_TYPES.DROPDOWN_BOX,
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
            type: FIELD_TYPES.DATE_RANGE_BOX,
            label: 'תקופת הפרויקט',
            required: true,
        },
        {
            id: 'description',
            type: FIELD_TYPES.LARGE_TEXT_BOX,
            label: 'תיאור הפרויקט',
            placeholder: 'פרטים נוספים אודות הפרויקט',
            rows: 3,
        },
    ] satisfies FormFieldSchema[],
};
