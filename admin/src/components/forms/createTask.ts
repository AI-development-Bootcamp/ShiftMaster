import { FormFieldSchema } from '../FormShell';
import { TFunction } from 'i18next';

interface Option {
    value: string;
    label: string;
}

export const getTaskForm = (
    t: TFunction,
    mode: 'create' | 'edit' = 'create',
    projects: Option[] = []
) => {
    const fields: FormFieldSchema[] = [
        {
            id: 'taskTitle',
            type: 'textBox',
            label: t('taskForm.fields.taskTitle'),
            placeholder: t('taskForm.fields.taskTitlePlaceholder'),
            required: true,
        },
        {
            id: 'projectId',
            type: 'dropdownBox',
            label: t('taskForm.fields.project'),
            placeholder: t('taskForm.fields.projectPlaceholder'),
            options: projects,
            required: true,
        },
        {
            id: 'dueDate',
            type: 'dateBox',
            label: t('taskForm.fields.dueDate'),
            required: true,
        },
        {
            id: 'description',
            type: 'largeTextBox',
            label: t('taskForm.fields.description'),
            placeholder: t('taskForm.fields.descriptionPlaceholder'),
            rows: 4,
        },
    ];

    return {
        title: mode === 'create' ? t('taskForm.createTitle') : t('taskForm.editTitle'),
        subtitle: mode === 'create' ? t('taskForm.createSubtitle') : t('taskForm.editSubtitle'),
        primaryActionLabel: mode === 'create' ? t('taskForm.createButton') : t('taskForm.editButton'),
        fields,
    };
};
