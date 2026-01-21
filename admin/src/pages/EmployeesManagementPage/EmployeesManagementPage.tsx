import { useState, useEffect, useCallback } from 'react';
import { FormShell, FormValues } from '../../components/FormShell';
import { createUserForm, editUserForm } from '../../components/forms';
import { TableShell, TableColumnDef, SortState } from '../../components/TableShell';
import { TableSearch } from '../../components/TableShell/TableSearch';
import { User, UserRole, UserListResponse, UserApiErrorCode } from '@abra-shift-master/shared';
import { useTranslation } from 'react-i18next';
import { ConfirmActionModal } from '../../components/ConfirmActionModal/ConfirmActionModal';
import { CONFIRM_VARIANTS } from '../../constants/ui';
import { ToastContainer } from '../../components/Toast';
import { useToast } from '../../components/Toast';
import { useDebounce } from '../../hooks/useDebounce';
import { apiClient } from '../../api';
import { AxiosError } from 'axios';
import '../../styles/EmployeesManagementPage.css';
import '../../styles/Toast.css';

// Error message mapping
const ERROR_MESSAGES: Record<string, string> = {
    [UserApiErrorCode.EMAIL_EXISTS]: 'כתובת האימייל כבר קיימת במערכת',
    [UserApiErrorCode.DUPLICATE_EMAIL]: 'כתובת האימייל כבר קיימת במערכת',
    [UserApiErrorCode.USER_NOT_FOUND]: 'המשתמש לא נמצא',
    [UserApiErrorCode.VALIDATION_ERROR]: 'אימות נתונים נכשל',
    [UserApiErrorCode.FORBIDDEN]: 'אין הרשאה לביצוע פעולה זו',
    [UserApiErrorCode.UNAUTHORIZED]: 'נדרשת התחברות מחדש',
    NETWORK_ERROR: 'שגיאת רשת, בדוק את החיבור לאינטרנט',
    SERVER_ERROR: 'שגיאת שרת, נסה שוב מאוחר יותר',
};

function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        const errorCode = error.response?.data?.error?.code;
        if (errorCode && errorCode in ERROR_MESSAGES) {
            return ERROR_MESSAGES[errorCode];
        }
        if (!error.response) {
            return ERROR_MESSAGES.NETWORK_ERROR;
        }
    }
    return ERROR_MESSAGES.SERVER_ERROR;
}

export function EmployeesManagementPage() {
    const { t } = useTranslation();
    const { toasts, showSuccess, showError, removeToast } = useToast();

    // State for API integration
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [showActiveOnly, setShowActiveOnly] = useState(true);

    // Form and UI state
    const [activeForm, setActiveForm] = useState<'create' | 'edit' | null>(null);
    const [formInitialValues, setFormInitialValues] = useState<FormValues>({});
    const [editingUserId, setEditingUserId] = useState<string | null>(null); // Will be used in Task 3.3 (Edit User)
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<SortState | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Delete Confirmation State
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    // Fetch users from API
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.get<UserListResponse['data']>('/users', {
                params: {
                    page,
                    limit: 11,
                    active: showActiveOnly,
                    search: debouncedSearch || undefined,
                },
            });

            setUsers(response.users);
            setTotalItems(response.pagination.total);
            setTotalPages(response.pagination.totalPages);
        } catch (err) {
            const errorMsg = getErrorMessage(err);
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [page, showActiveOnly, debouncedSearch, showError]);

    // Fetch on mount and when dependencies change
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        if (page !== 1) {
            setPage(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, showActiveOnly]);

    // Columns Configuration
    const columns: TableColumnDef<User>[] = [
        { key: 'user_id', header: t('employeesPage.tableHeaders.employeeId'), type: 'text', sortable: false, width: '10%' },
        { key: 'full_name', header: t('employeesPage.tableHeaders.fullName'), type: 'text', sortable: false, width: '20%' },
        { key: 'email', header: t('employeesPage.tableHeaders.email'), type: 'text', sortable: false, width: '25%' },
        {
            key: 'role',
            header: t('employeesPage.tableHeaders.role'),
            type: 'text',
            sortable: false,
            width: '15%',
            accessor: (row) => row.role === UserRole.ADMIN ? t('employeesPage.roles.admin') : t('employeesPage.roles.employee')
        },
        { key: 'job_title', header: t('employeesPage.tableHeaders.jobTitle'), type: 'text', sortable: false, width: '15%' },
        { key: 'actions', header: t('common.actions'), type: 'actions', width: '10%' }
    ];

    const handleSubmit = async (values: FormValues) => {
        if (!activeForm) return;

        if (activeForm === 'create') {
            // Map form values to API format
            const userData = {
                full_name: values.full_name as string,
                email: values.email as string,
                password: values.password as string,
                role: values.role as string,
                job_title: values.jobTitle as string | undefined,
            };

            setFormSubmitting(true);
            try {
                await apiClient.post('/users', userData);
                showSuccess('עובד נוסף בהצלחה');
                setActiveForm(null);
                // Refresh user list
                await fetchUsers();
            } catch (err) {
                const errorMsg = getErrorMessage(err);
                showError(errorMsg);
                // Keep form open for correction
            } finally {
                setFormSubmitting(false);
            }
        } else if (activeForm === 'edit') {
            // Get user ID from state
            if (!editingUserId) {
                showError('שגיאה: לא נמצא מזהה משתמש');
                return;
            }

            // Map form values to API format (password is optional for edit)
            const userData: Record<string, unknown> = {
                full_name: values.full_name as string,
                email: values.email as string,
                role: values.role as string,
                job_title: values.jobTitle as string | undefined,
            };

            // Only include password if it was provided
            if (values.password) {
                userData.password = values.password as string;
            }

            setFormSubmitting(true);
            try {
                await apiClient.patch(`/users/${editingUserId}`, userData);
                showSuccess('פרטי העובד עודכנו בהצלחה');
                setActiveForm(null);
                setEditingUserId(null);
                // Refresh user list
                await fetchUsers();
            } catch (err) {
                const errorMsg = getErrorMessage(err);
                showError(errorMsg);
                // Keep form open for correction
            } finally {
                setFormSubmitting(false);
            }
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUserId(user.user_id);
        setFormInitialValues({
            full_name: user.full_name,
            email: user.email,
            role: user.role === UserRole.ADMIN ? 'admin' : 'regular',
            jobTitle: user.job_title || '',
            // Password usually not pre-filled for security
        });
        setActiveForm('edit');
    };

    const handleDeleteClick = (user: User) => {
        setDeletingUser(user);
    };

    const handleConfirmDelete = () => {
        if (!deletingUser) return;
        console.log('Delete Employee ID:', deletingUser.user_id);
        // This will be implemented in Task 3.4
        setDeletingUser(null);
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
                    {/* Visual Order RTL: [Search] [Filter] [Button] (Button is Leftmost) */}
                    <TableSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t('common.searchPlaceholder')}
                    />

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={!showActiveOnly}
                            onChange={(e) => setShowActiveOnly(!e.target.checked)}
                            style={{ cursor: 'pointer' }}
                        />
                        <span>הצג עובדים לא פעילים</span>
                    </label>

                    <button
                        className="admin-action-btn"
                        onClick={() => setActiveForm('create')}
                    >
                        {t('employeesPage.addEmployee')}
                    </button>
                </div>
            </div>

            {error && !loading && (
                <div style={{ padding: '16px', background: '#fee', border: '1px solid #fcc', borderRadius: '8px', marginBottom: '16px' }}>
                    <p style={{ margin: 0, color: '#c33' }}>{error}</p>
                    <button
                        onClick={() => fetchUsers()}
                        style={{ marginTop: '8px', padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        נסה שוב
                    </button>
                </div>
            )}

            {!error && users.length === 0 && !loading && (
                <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                    <p>לא נמצאו עובדים</p>
                </div>
            )}

            <TableShell
                tableId="employees-table"
                data={users}
                columns={columns}
                getRowId={(row) => String(row.user_id)}
                pagination={{ page, pageSize: 11, totalItems, totalPages }}
                onPageChange={setPage}
                sort={sort}
                onSortChange={setSort}
                isLoading={loading}
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
                            onClick: (row) => handleDeleteClick(row)
                        }
                    ]
                }}
            />

            {activeForm === 'create' && (
                <FormShell
                    {...createUserForm}
                    onSubmit={handleSubmit}
                    onClose={() => setActiveForm(null)}
                    isSubmitting={formSubmitting}
                />
            )}

            {activeForm === 'edit' && (
                <FormShell
                    {...editUserForm}
                    initialValues={formInitialValues}
                    onSubmit={handleSubmit}
                    onClose={() => {
                        setActiveForm(null);
                        setEditingUserId(null);
                    }}
                    isSubmitting={formSubmitting}
                />
            )}

            <ConfirmActionModal
                isOpen={!!deletingUser}
                title={t('confirmDelete.employee.title')}
                description={`${t('confirmDelete.employee.description')} (${deletingUser?.full_name})`}
                variant={CONFIRM_VARIANTS.DANGER}
                confirmLabel={t('confirmDelete.confirmLabel')}
                cancelLabel={t('confirmDelete.cancelLabel')}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeletingUser(null)}
            />

            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </div>
    );
}
