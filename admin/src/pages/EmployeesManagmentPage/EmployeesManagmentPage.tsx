import { useState } from 'react';
import { FormShell, FormValues } from '../../components/FormShell';
import { createClientForm, createUserForm, createProjectForm, createTaskForm } from '../../components/forms';
import '../../styles/EmployeesManagmentPage.css';

type ActiveForm = 'client' | 'user' | 'project' | 'task' | null;

export function EmployeesManagmentPage() {
    const [activeForm, setActiveForm] = useState<ActiveForm>(null);

    const handleSubmit = (values: FormValues) => {
        console.log(`Form submitted (${activeForm}):`, values);
        setActiveForm(null);
    };

    const forms = {
        client: createClientForm,
        user: createUserForm,
        project: createProjectForm,
        task: createTaskForm,
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
                    {renderButton('client', '+ לקוח חדש')}
                    {renderButton('user', '+ עובד חדש')}
                    {renderButton('project', '+ פרויקט חדש')}
                    {renderButton('task', '+ משימה חדשה')}
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

