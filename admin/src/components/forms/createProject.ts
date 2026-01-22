import { FormFieldSchema } from '../FormShell';
import { TFunction } from 'i18next';

interface Option {
    value: string;
    label: string;
}

export const getProjectForm = (
    t: TFunction,
    mode: 'create' | 'edit' = 'create',
    clients: Option[] = [],
    managers: Option[] = []
) => {
    const fields: FormFieldSchema[] = [
        {
            id: 'projectName',
            type: 'textBox',
            label: t('projectForm.fields.projectName'),
            placeholder: t('projectForm.fields.projectNamePlaceholder'),
            required: true,
        },
        {
            id: 'clientId',
            type: 'dropdownBox',
            label: t('projectForm.fields.client'),
            placeholder: t('projectForm.fields.clientPlaceholder'),
            options: clients,
            required: true,
        },
        {
            id: 'managerUserId',
            type: 'dropdownBox',
            label: t('projectForm.fields.manager'),
            placeholder: t('projectForm.fields.managerPlaceholder'),
            options: managers,
            required: false,
        },
        {
            id: 'projectDuration',
            type: 'dateRangeBox',
            label: t('projectForm.fields.dates'),
            required: true,
        },
        // We can add Time Format Type selector here if needed, but per request default is 'sum'.
        // If user wants to change it, we can add it. For now, we will add it as optional, or just auto-set it in backend/frontend logic.
        // The user request said: "Time Format Type for Projects: Set default to sum."
        // We will keep it simple for now and not expose it unless requested, or expose it with default.
        // Let's hide it for now to keep form simple, or add it if the UI needs it. 
        // Logic: "Time Format Type for Projects: Set default to sum." implies it's a backend default or invisible field.
        // However, if we want to allow editing, we might need it. Let's stick strictly to requirements: "Set default to sum".
        {
            id: 'description',
            type: 'largeTextBox',
            label: t('projectForm.fields.description'),
            placeholder: t('projectForm.fields.descriptionPlaceholder'),
            rows: 3,
        },
    ];

    return {
        title: mode === 'create' ? t('projectForm.createTitle') : t('projectForm.editTitle'),
        subtitle: mode === 'create' ? t('projectForm.createSubtitle') : t('projectForm.editSubtitle'),
        primaryActionLabel: mode === 'create' ? t('projectForm.createButton') : t('projectForm.editButton'),
        fields,
    };
};
