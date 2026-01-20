import { useState } from 'react';
import { FormShell, FormValues } from '../../components/FormShell';
import { createUserForm } from '../../components/forms';
import { CreateDropdownMenu } from '../../components/CreateDropdownMenu';
import { CreateMenuOption } from '../../components/CreateDropdownMenu/types';
import { DROPDOWN_PLACEMENT } from '../../constants/ui';
import '../../styles/EmployeesManagmentPage.css';

type ActiveForm = 'user' | null;

export function EmployeesManagmentPage() {
    const [activeForm, setActiveForm] = useState<ActiveForm>(null);

    const handleSubmit = (values: FormValues) => {
        console.log(`Form submitted (${activeForm}):`, values);
        setActiveForm(null);
    };

    const forms = {
        user: createUserForm,
    };

    const menuOptions: CreateMenuOption[] = [
        {
            id: 'create-user',
            label: 'צור עובד חדש',
            onSelect: () => setActiveForm('user'),
        },
    ];

    return (
        <div className="employees-managment-page">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>ניהול עובדים</h1>
                    <CreateDropdownMenu
                        label="יצירה"
                        options={menuOptions}
                        placement={DROPDOWN_PLACEMENT.BOTTOM_START}
                    />
                </div>
            </div>

            <p style={{ marginTop: '30px' }}>כאן יופיע טבלת ניהול עובדים.</p>

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

