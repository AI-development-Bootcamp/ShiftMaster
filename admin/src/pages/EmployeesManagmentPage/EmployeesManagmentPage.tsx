import { useState, useMemo } from 'react';
import { FormShell, FormValues } from '../../components/FormShell';
import { createUserForm } from '../../components/forms';
import { TableShell, TableColumnDef, SortState } from '../../components/TableShell';
import { mockUsers } from '../../mocks/users';
import { User, UserRole } from '@abra-shift-master/shared';
import '../../styles/EmployeesManagmentPage.css';

export function EmployeesManagmentPage() {
    const [activeForm, setActiveForm] = useState<'user' | null>(null);
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<SortState | null>(null);

    // Columns Configuration
    const columns: TableColumnDef<User>[] = [
        { key: 'user_id', header: 'מספר עובד', type: 'text', sortable: true, width: '10%' },
        { key: 'full_name', header: 'שם מלא', type: 'text', sortable: true, width: '20%' },
        { key: 'email', header: 'כתובת מייל', type: 'text', sortable: true, width: '25%' },
        {
            key: 'role',
            header: 'סוג עובד',
            type: 'text',
            sortable: true,
            width: '15%',
            accessor: (row) => row.role === UserRole.ADMIN ? 'מנהל' : 'עובד'
        },
        { key: 'job_title', header: 'תואר תפקיד', type: 'text', sortable: true, width: '15%' },
        { key: 'actions', header: 'פעולות', type: 'actions', width: '10%' }
    ];

    const handleSubmit = (values: FormValues) => {
        console.log('User Form submitted:', values);
        // Here we would normally map form values to User object and update state/backend
        setActiveForm(null);
    };

    // Client-side pagination & sorting logic (similar to other pages)
    const { data, totalItems, totalPages } = useMemo(() => {
        let processedData = [...users];

        // 1. Sort
        if (sort && sort.length > 0) {
            processedData.sort((a, b) => {
                for (const sortItem of sort) {
                    const { key, direction } = sortItem;
                    const aValue = key === 'role'
                        ? (a.role === UserRole.ADMIN ? 'מנהל' : 'עובד')
                        : (a as any)[key];
                    const bValue = key === 'role'
                        ? (b.role === UserRole.ADMIN ? 'מנהל' : 'עובד')
                        : (b as any)[key];

                    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        // 2. Pagination
        const pageSize = 10;
        const totalItems = processedData.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const paginatedData = processedData.slice(startIndex, startIndex + pageSize);

        return { data: paginatedData, totalItems, totalPages };
    }, [users, page, sort]);

    const handleEdit = (user: User) => {
        console.log('Edit user:', user);
        // In a real implementation we would pass 'user' data to the form
        // setActiveForm('user'); // Disabled as per request
    };

    const handleDelete = (user: User) => {
        console.log('Delete user:', user);
        if (window.confirm(`האם למחוק את העובד ${user.full_name}?`)) {
            setUsers(prev => prev.filter(u => u.user_id !== user.user_id));
        }
    };

    return (
        <div className="employees-managment-page">
            <div className="employees-page-header">
                <h1>ניהול עובדים</h1>
                <button
                    className="add-employee-btn"
                    onClick={() => setActiveForm('user')}
                >
                    + עובד חדש
                </button>
            </div>

            <TableShell
                tableId="employees-table"
                data={data}
                columns={columns}
                getRowId={(row) => String(row.user_id)}
                pagination={{ page, pageSize: 10, totalItems, totalPages }}
                onPageChange={setPage}
                sort={sort}
                onSortChange={setSort}
                isLoading={false}
                rowActions={{
                    showEdit: true,
                    showDelete: true,
                    onEdit: handleEdit,
                    onDelete: handleDelete,
                }}
            />

            {activeForm === 'user' && (
                <FormShell
                    {...createUserForm}
                    onSubmit={handleSubmit}
                    onClose={() => setActiveForm(null)}
                />
            )}
        </div>
    );
}

