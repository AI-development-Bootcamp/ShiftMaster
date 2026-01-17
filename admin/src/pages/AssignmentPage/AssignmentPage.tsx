import { useState } from 'react';
import { FormShell, FormValues } from '../../components/FormShell';
import { createClientForm, createProjectForm, createTaskForm } from '../../components/forms';
import { DROPDOWN_PLACEMENT } from '../../constants/ui';
import { CreateDropdownMenu } from '../../components/CreateDropdownMenu';
import { CreateMenuOption } from '../../components/CreateDropdownMenu/types';
import '../../styles/AssignmentPage.css';

type ActiveForm = 'client' | 'project' | 'task' | null;

export function AssignmentPage() {
    const [activeForm, setActiveForm] = useState<ActiveForm>(null);

    const handleSubmit = (values: FormValues) => {
        console.log(`Form submitted (${activeForm}):`, values);
        setActiveForm(null);
    };

    const forms = {
        client: createClientForm,
        project: createProjectForm,
        task: createTaskForm,
    };

    // Options linked to forms
    const menuOptions: CreateMenuOption[] = [
        {
            id: '1',
            label: 'צור לקוח חדש',
            onSelect: () => setActiveForm('client')
        },
        {
            id: '2',
            label: 'צור פרויקט חדש',
            onSelect: () => setActiveForm('project')
        },
        {
            id: '3',
            label: 'צור משימה חדשה',
            onSelect: () => setActiveForm('task')
        },
    ];

    return (
        <div className="assignment-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>שיבוץ עובדים</h1>
                <CreateDropdownMenu
                    options={menuOptions}
                    placement={DROPDOWN_PLACEMENT.BOTTOM_START}
                />
            </div>
            <p>כאן יופיע מסך שיבוץ עובדים למשימות.</p>

            {activeForm && forms[activeForm] && (
                <FormShell
                    {...forms[activeForm]}
                    onSubmit={handleSubmit}
                    onClose={() => setActiveForm(null)}
                />
            )}
        </div>
    );
}
