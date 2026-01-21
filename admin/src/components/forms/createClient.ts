import { FormFieldSchema } from '../FormShell';
import { TFunction } from 'i18next';

export const getClientForm = (t: TFunction, mode: 'create' | 'edit' = 'create') => {
    const fields: FormFieldSchema[] = [
        {
            id: 'clientName',
            type: 'textBox',
            label: t('clientForm.fields.clientName'),
            placeholder: t('clientForm.fields.clientNamePlaceholder'),
            required: true,
        },
        {
            id: 'contactDetails',
            type: 'largeTextBox',
            label: t('clientForm.fields.contactDetails'),
            placeholder: t('clientForm.fields.contactDetailsPlaceholder'),
        },
    ];

    return {
        title: mode === 'create' ? t('clientForm.createTitle') : t('clientForm.editTitle'),
        subtitle: mode === 'create' ? t('clientForm.createSubtitle') : t('clientForm.editSubtitle'),
        primaryActionLabel: mode === 'create' ? t('clientForm.createButton') : t('clientForm.editButton'),
        fields,
    };
};
