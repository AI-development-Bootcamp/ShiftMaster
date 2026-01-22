import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { TableShell } from '../../components/TableShell';
import { TableSearch } from '../../components/TableShell/TableSearch';
import { useTableSearch } from '../../hooks/useTableSearch';
import { TableColumnDef, SortState } from '../../components/TableShell/types';
import { ProjectTimeFormatType, UserRole, User } from '@abra-shift-master/shared';
// Removed mocks in favor of real data
// import { mockProjects } from '../../mocks/projects';
// import { mockClients } from '../../mocks/clients';
// import { mockCurrentUser } from '../../mocks/users'; 
import { MonthLockButton, MonthLockModal } from '../../components/MonthLocks';
import { FormShell, FormValues } from '../../components/FormShell';
import { getClientForm } from '../../components/forms/createClient';
import { getProjectForm } from '../../components/forms/createProject';
import { getTaskForm } from '../../components/forms/createTask';
import { CreateDropdownMenu } from '../../components/CreateDropdownMenu/CreateDropdownMenu';
import { useTranslation } from 'react-i18next';
import { assignmentService, Client, Project, CreateClientDTO, CreateProjectDTO, CreateTaskDTO } from '../../services/assignmentService';
import { useToast, ToastContainer } from '../../components/Toast';
import '../../styles/EntriesManagementPage.css';

// We can reuse the same error codes or define specific ones
export const ERROR_CODES = {
    ENTRIES_LOAD_FAILED: 'ENTRIES_LOAD_FAILED',
    FORM_SUBMIT_FAILED: 'FORM_SUBMIT_FAILED',
} as const;

export function EntriesManagementPage() {
    const { t } = useTranslation();
    const { toasts, showError, showSuccess, removeToast } = useToast();
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<SortState | null>([
        { key: 'client_name', direction: 'asc' },
        { key: 'name', direction: 'asc' }
    ]);
    const [isMonthLockModalOpen, setIsMonthLockModalOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // --- Data State ---
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]); // For manager selection
    // const [tasks, setTasks] = useState<Task[]>([]); // If we need tasks later
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Create Form State ---
    const [activeForm, setActiveForm] = useState<'createClient' | 'createProject' | 'createTask' | null>(null);

    // --- Fetch Data ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [
                fetchedClients,
                fetchedProjects,
                fetchedUsers
            ] = await Promise.all([
                assignmentService.fetchClients(),
                assignmentService.fetchProjects(),
                assignmentService.fetchPotentialEmployees()
            ]);

            setClients(fetchedClients);
            setProjects(fetchedProjects);
            setUsers(fetchedUsers);
        } catch (err) {
            const code = ERROR_CODES.ENTRIES_LOAD_FAILED;
            console.error(`[${code}] Failed to fetch entries data:`, err);
            setError(t('common.error')); // OR create specific translation key
            showError({ message: t('common.error'), code });
        } finally {
            setIsLoading(false);
        }
    }, [t, showError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Derived Options for Forms ---
    const clientOptions = useMemo(() => clients.map(c => ({ value: c.client_id, label: c.name })), [clients]);
    const projectOptions = useMemo(() => projects.map(p => ({ value: p.project_id, label: p.name })), [projects]);
    const managerOptions = useMemo(() => {
        return users.map(u => ({ value: String(u.user_id), label: u.full_name }));
    }, [users]);

    // Fallback for "current user" in MonthLockButton if needed, ideally getting from auth context/store
    // For now, picking the first admin or just a placeholder if list empty, strict requirement not specified
    // But MonthLockButton needs a `user` prop. Let's try to find an admin or just pass a bare minimum object if `users` is empty.
    // In a real app we'd use `useAuth()` or similar. 
    // The previous code imported `mockCurrentUser`. Let's assume we can get one from `users` or keep mock for JUST the button if strictly needed, 
    // but the prompt implies using real data. I'll just use the first user or a safe fallback to avoid crash.
    const currentUserForLock = useMemo((): User => {
        // Just finding ANY admin to pass to the button for visual purposes if auth slice isn't ready here
        const admin = users.find(u => u.role === UserRole.ADMIN);

        if (admin) return admin;

        // Fallback dummy user that satisfies the full User interface
        return {
            user_id: '0',
            full_name: 'Admin User',
            email: 'admin@example.com',
            role: UserRole.ADMIN,
            job_title: 'Administrator',
            active: true,
            created_at: new Date().toISOString()
        };
    }, [users]);


    const handleFormSubmit = async (values: FormValues) => {
        try {
            console.log(`Submitted ${activeForm} form:`, values);

            if (activeForm === 'createClient') {
                const dto: CreateClientDTO = {
                    name: values.clientName as string,
                    contact_info: values.contactDetails as string
                };
                await assignmentService.createClient(dto);
                showSuccess(t('common.success') || 'Client created successfully');
            } else if (activeForm === 'createProject') {
                const duration = values.projectDuration as { start: string; end: string } | undefined;
                const dto: CreateProjectDTO = {
                    client_id: values.clientId as string,
                    name: values.projectName as string,
                    manager_user_id: values.managerUserId ? (values.managerUserId as string) : undefined,
                    description: values.description as string,
                    start_date: (duration?.start || new Date().toISOString()).split('T')[0],
                    end_date: duration?.end ? duration.end.split('T')[0] : undefined,
                    time_format_type: 'sum', // Default
                };
                await assignmentService.createProject(dto);
                showSuccess(t('common.success') || 'Project created successfully');
            } else if (activeForm === 'createTask') {
                const dto: CreateTaskDTO = {
                    project_id: values.projectId as string,
                    name: values.taskTitle as string,
                    description: values.description as string,
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: (values.dueDate as string)?.split('T')[0],
                };
                await assignmentService.createTask(dto);
                showSuccess(t('common.success') || 'Task created successfully');
            }

            setActiveForm(null);
            fetchData(); // Refresh data
        } catch (formError) {
            const code = ERROR_CODES.FORM_SUBMIT_FAILED;
            console.error(`[${code}] Form submission failed:`, formError);
            showError({ message: t('common.error') || 'An error occurred', code });
        }
    };

    const createDropdownOptions = useMemo(() => [
        { id: 'client', label: t('createMenu.options.addClient'), onSelect: () => setActiveForm('createClient') },
        { id: 'project', label: t('createMenu.options.addProject'), onSelect: () => setActiveForm('createProject') },
        { id: 'task', label: t('createMenu.options.addTask'), onSelect: () => setActiveForm('createTask') },
    ], [t]);


    // Handle radio change - update project (stub for now, but using real data structure)
    const handleRadioChange = async ({ row, columnKey, nextValue }: {
        row: Project;
        columnKey: string;
        nextValue: string;
    }) => {
        // Optimistic update
        setProjects(prevProjects =>
            prevProjects.map(project =>
                project.project_id === row.project_id
                    ? { ...project, [columnKey]: nextValue as ProjectTimeFormatType }
                    : project
            )
        );

        // TODO: Backend update
        // try {
        //    await assignmentService.updateProject(row.project_id, { [columnKey]: nextValue });
        // } catch (e) { ...revert... }

        console.log('Radio Change (local optimistic):', {
            projectId: row.project_id,
            projectName: row.name,
            field: columnKey,
            newValue: nextValue
        });
    };

    // --- Search Logic (Reusable) ---
    // Search by project name
    const { searchQuery, setSearchQuery, filteredData } = useTableSearch(projects, ['name']);

    // Reset pagination when search/data changes
    useEffect(() => {
        setPage(1);
    }, [searchQuery, projects.length]);

    // Columns definition
    const columns: TableColumnDef<Project>[] = [
        {
            key: 'client_name',
            header: t('entriesPage.tableHeaders.clientName'),
            type: 'text',
            sortable: true,
            disableSortClearing: true,
            width: '30%',
            accessor: (row) => {
                const client = clients.find(c => c.client_id === row.client_id);
                return client ? client.name : t('common.unknown');
            }
        },
        {
            key: 'name',
            header: t('entriesPage.tableHeaders.projectName'),
            type: 'text',
            sortable: true,
            disableSortClearing: true,
            width: '30%',
            accessor: (row) => row.name,
        },
        {
            key: 'time_format_type',
            header: t('entriesPage.tableHeaders.reportType'),
            type: 'radio',
            width: '40%',
            accessor: (row) => row.time_format_type,
            radioOptions: [
                { value: ProjectTimeFormatType.SUM, label: t('entriesPage.reportTypes.sum') },
                { value: ProjectTimeFormatType.START_END, label: t('entriesPage.reportTypes.startEnd') }
            ]
        }
    ];

    // Data processing (Sorting, Pagination)
    const { data, totalItems, totalPages } = useMemo(() => {
        const processedData = [...filteredData];

        // 1. Sort
        if (sort && sort.length > 0) {
            processedData.sort((a, b) => {
                for (const sortItem of sort) {
                    let valA: string | number = '';
                    let valB: string | number = '';

                    // Special handling for client name sorting
                    if (sortItem.key === 'client_name') {
                        valA = clients.find(c => c.client_id === a.client_id)?.name || '';
                        valB = clients.find(c => c.client_id === b.client_id)?.name || '';
                    } else {
                        valA = String(a[sortItem.key as keyof Project] || '');
                        valB = String(b[sortItem.key as keyof Project] || '');
                    }

                    if (valA < valB) return sortItem.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return sortItem.direction === 'asc' ? 1 : -1;
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
    }, [page, sort, filteredData, clients]);

    return (
        <div className="entries-management-page">
            <div className="entries-management-page-header">
                {/* Title Section (Right/Start) */}
                <div className="page-header-title-group">
                    <h1>{t('entriesPage.title')}</h1>
                    <p>{t('entriesPage.subtitle')}</p>
                </div>

                {/* Actions Section (Left/End) */}
                <div className="month-lock-button-container" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Visual Order RTL: [CreateDropdown] [Search] [MonthButton] */}
                    <TableSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t('entriesPage.searchBarHint')}
                    />
                    <CreateDropdownMenu
                        label={t('createMenu.title')}
                        options={createDropdownOptions}
                    />

                    <MonthLockButton
                        ref={buttonRef}
                        user={currentUserForLock}
                        onClick={() => setIsMonthLockModalOpen(true)}
                    />
                    <MonthLockModal
                        isOpen={isMonthLockModalOpen}
                        onClose={() => setIsMonthLockModalOpen(false)}
                        buttonRef={buttonRef}
                    />
                </div>
            </div>

            {error && !data.length ? (
                <div className="error-container">
                    {error} <button onClick={fetchData}>{t('common.retry')}</button>
                </div>
            ) : (
                <TableShell
                    tableId="projects-table"
                    data={data}
                    columns={columns}
                    getRowId={(row) => String(row.project_id)}
                    pagination={{
                        page,
                        pageSize: 11,
                        totalItems,
                        totalPages
                    }}
                    onPageChange={setPage}
                    sort={sort}
                    onSortChange={setSort}
                    onRadioChange={handleRadioChange}
                    isLoading={isLoading}
                />
            )}

            {/* Create Forms */}
            {activeForm === 'createClient' && (
                <FormShell
                    {...getClientForm(t, 'create')}
                    initialValues={{}}
                    onClose={() => setActiveForm(null)}
                    onSubmit={handleFormSubmit}
                />
            )}

            {activeForm === 'createProject' && (
                <FormShell
                    {...getProjectForm(t, 'create', clientOptions, managerOptions)}
                    initialValues={{}}
                    onClose={() => setActiveForm(null)}
                    onSubmit={handleFormSubmit}
                />
            )}

            {activeForm === 'createTask' && (
                <FormShell
                    {...getTaskForm(t, 'create', projectOptions)}
                    initialValues={{}}
                    onClose={() => setActiveForm(null)}
                    onSubmit={handleFormSubmit}
                />
            )}

            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </div>
    );
}
