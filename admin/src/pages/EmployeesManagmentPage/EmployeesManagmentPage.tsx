import { useState } from 'react';
import { FormShell, FormValues } from '../../components/FormShell';
import { createClientForm, createUserForm, createProjectForm, createTaskForm } from '../../components/forms';
import { FORM_KEYS } from '../../constants/forms';
import '../../styles/EmployeesManagmentPage.css';

type ActiveForm = typeof FORM_KEYS[keyof typeof FORM_KEYS] | null;

export function EmployeesManagmentPage() {
    const [activeForm, setActiveForm] = useState<ActiveForm>(null);

    const handleSubmit = (values: FormValues) => {
        console.log(`Form submitted (${activeForm}):`, values);
        setActiveForm(null);
    };

    const forms = {
        [FORM_KEYS.CLIENT]: createClientForm,
        [FORM_KEYS.USER]: createUserForm,
        [FORM_KEYS.PROJECT]: createProjectForm,
        [FORM_KEYS.TASK]: createTaskForm,
    };

    const renderButton = (type: ActiveForm, label: string) => (
        <button
            onClick={() => setActiveForm(type)}
            style={{
                padding: '10px 20px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginLeft: '10px'
            }}
        >
            {label}
        </button>
    );

    return (
        <div className="employees-managment-page">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>דמו טפסים (FormShell)</h1>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {renderButton(FORM_KEYS.CLIENT, '+ לקוח חדש')}
                    {renderButton(FORM_KEYS.USER, '+ עובד חדש')}
                    {renderButton(FORM_KEYS.PROJECT, '+ פרויקט חדש')}
                    {renderButton(FORM_KEYS.TASK, '+ משימה חדשה')}
                </div>
            </div>

            <p style={{ marginTop: '30px' }}>לחץ על הכפתורים למעלה כדי לפתוח את הטפסים השונים.</p>

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

