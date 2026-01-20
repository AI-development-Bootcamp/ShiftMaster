import { useState, useMemo, useEffect } from 'react';
import { FormShell, FormValues } from '../../components/FormShell';
import { createUserForm, editUserForm } from '../../components/forms';
import { TableShell, TableColumnDef, SortState } from '../../components/TableShell';
import { TableSearch } from '../../components/TableShell/TableSearch';
import { useTableSearch } from '../../hooks/useTableSearch';
import { mockUsers } from '../../mocks/users';
import { User, UserRole } from '@abra-shift-master/shared';
import { useTranslation } from 'react-i18next';
import '../../styles/EmployeesManagementPage.css';

export function EmployeesManagementPage() {
    const { t } = useTranslation();
    const [activeForm, setActiveForm] = useState<'create' | 'edit' | null>(null);
    const [formInitialValues, setFormInitialValues] = useState<FormValues>({});
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<SortState | null>(null);

    // --- Search Logic (Reusable) ---
    const { searchQuery, setSearchQuery, filteredData } = useTableSearch(users, ['full_name', 'email', 'job_title']);

    // Watch filteredData and clamp page if needed
    useEffect(() => {
        setPage(1); // Reset to page 1 on search or data change
    }, [searchQuery, users.length]);

    // Columns Configuration
    const columns: TableColumnDef<User>[] = [
        { key: 'user_id', header: t('employeesPage.tableHeaders.employeeId'), type: 'text', sortable: true, width: '10%' },
        { key: 'full_name', header: t('employeesPage.tableHeaders.fullName'), type: 'text', sortable: true, width: '20%' },
        { key: 'email', header: t('employeesPage.tableHeaders.email'), type: 'text', sortable: true, width: '25%' },
        {
            key: 'role',
            header: t('employeesPage.tableHeaders.role'),
            type: 'text',
            sortable: true,
            width: '15%',
            accessor: (row) => row.role === UserRole.ADMIN ? t('employeesPage.roles.admin') : t('employeesPage.roles.employee')
        },
        { key: 'job_title', header: t('employeesPage.tableHeaders.jobTitle'), type: 'text', sortable: true, width: '15%' },
        { key: 'actions', header: t('common.actions'), type: 'actions', width: '10%' }
    ];

    const handleSubmit = (values: FormValues) => {
        console.log(`User Form submitted (${activeForm}):`, values);
        // Here we would normally map form values to User object and update state/backend
        setActiveForm(null);
    };

    // Client-side pagination & sorting logic (similar to other pages)
    const { data, totalItems, totalPages } = useMemo(() => {
        const processedData = [...filteredData];

        // 1. Sort
        if (sort && sort.length > 0) {
            processedData.sort((a, b) => {
                for (const sortItem of sort) {
                    const { key, direction } = sortItem;
                    const aValue = key === 'role'
                        ? (a.role === UserRole.ADMIN ? t('employeesPage.roles.admin') : t('employeesPage.roles.employee'))
                        : a[key as keyof User];
                    const bValue = key === 'role'
                        ? (b.role === UserRole.ADMIN ? t('employeesPage.roles.admin') : t('employeesPage.roles.employee'))
                        : b[key as keyof User];

                    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        // 2. Pagination
        const pageSize = 11;
        const totalItems = processedData.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const paginatedData = processedData.slice(startIndex, startIndex + pageSize);

        return { data: paginatedData, totalItems, totalPages };
    }, [filteredData, page, sort, t]);

    const handleEditUser = (user: User) => {
        setFormInitialValues({
            full_name: user.full_name,
            email: user.email,
            role: user.role === UserRole.ADMIN ? 'admin' : 'regular',
            jobTitle: user.job_title || '',
            // Password usually not pre-filled for security
        });
        setActiveForm('edit');
    };

    const handleDelete = (user: User) => {
        console.log('Delete user:', user);
        if (window.confirm(`${t('employeesPage.confirmDelete')} ${user.full_name}?`)) {
            setUsers(prev => prev.filter(u => u.user_id !== user.user_id));
        }
    };

    return (
        <div className="employees-management-page">
            <div className="employees-page-header">
                {/* Title Section (Right/Start) */}
                <div className="page-header-title-group">
                    <h1>{t('employeesPage.title')}</h1>
                    <p>{t('employeesPage.subtitle')}</p>
                </div>

                {/* Actions Section (Left/End) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Visual Order RTL: [Search] [Button] (Button is Leftmost) */}
                    <TableSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t('common.searchPlaceholder')}
                    />

                    <button
                        className="admin-action-btn"
                        onClick={() => setActiveForm('create')}
                    >
                        {t('employeesPage.addEmployee')}
                    </button>
                </div>
            </div>

            <TableShell
                tableId="employees-table"
                data={data}
                columns={columns}
                getRowId={(row) => String(row.user_id)}
                pagination={{ page, pageSize: 11, totalItems, totalPages }}
                onPageChange={setPage}
                sort={sort}
                onSortChange={setSort}
                isLoading={false}
                rowActions={{
                    showEdit: true,
                    showDelete: true,
                    editOptions: [
                        {
                            label: t('employeesPage.actions.editEmployee', 'ערוך עובד'),
                            onClick: (row) => handleEditUser(row)
                        }
                    ],
                    deleteOptions: [
                        {
                            label: t('employeesPage.actions.deleteEmployee', 'מחק עובד'),
                            variant: 'danger',
                            onClick: (row) => handleDelete(row)
                        }
                    ]
                }}
            />

            {activeForm === 'create' && (
                <FormShell
                    {...createUserForm}
                    onSubmit={handleSubmit}
                    onClose={() => setActiveForm(null)}
                />
            )}

            {activeForm === 'edit' && (
                <FormShell
                    {...editUserForm}
                    initialValues={formInitialValues}
                    onSubmit={handleSubmit}
                    onClose={() => setActiveForm(null)}
                />
            )}
        </div>
    );
}
