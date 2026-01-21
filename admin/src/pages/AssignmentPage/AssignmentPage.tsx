
import { useState, useMemo, useEffect, useCallback } from 'react';
import { TableShell } from '../../components/TableShell';
import { TableSearch } from '../../components/TableShell/TableSearch';
import { useTableSearch } from '../../hooks/useTableSearch';
import { TableColumnDef, SortState, PersonChip } from '../../components/TableShell/types';
import { TaskEmployeeAssignmentForm, EmployeeRow } from '../../components/task/TaskEmployeeAssignmentForm';
import { FormShell, FormValues } from '../../components/FormShell';
import { editClientForm, createClientForm } from '../../components/forms/createClient';
import { editProjectForm, createProjectForm } from '../../components/forms/createProject';
import { editTaskForm, createTaskForm } from '../../components/forms/createTask';
import { CreateDropdownMenu } from '../../components/CreateDropdownMenu/CreateDropdownMenu';
import { ConfirmActionModal } from '../../components/ConfirmActionModal/ConfirmActionModal';
import { CONFIRM_VARIANTS } from '../../constants/ui';
import { useTranslation } from 'react-i18next';
import { UserRole, User } from '@abra-shift-master/shared';
// Import services and types
import { assignmentService, Client, Project, Task } from '../../services/assignmentService';
import { AdminTaskAssignment } from '@abra-shift-master/shared';
import { useToast, ToastContainer } from '../../components/Toast';

import '../../styles/AssignmentPage.css';

// Stable error codes for traceable logging
export const ERROR_CODES = {
    ASSIGNMENT_LOAD_FAILED: 'ASSIGNMENT_LOAD_FAILED',
    FORM_SUBMIT_FAILED: 'FORM_SUBMIT_FAILED',
    DELETE_FAILED: 'DELETE_FAILED',
    ASSIGNMENT_FAILED: 'ASSIGNMENT_FAILED',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

interface AssignmentTableRow {
    id: string;
    task_id: string;
    client_id: string;
    project_id: string;
    client_name: string;
    project_name: string;
    task_name: string;
    assignees: PersonChip[];
}

export function AssignmentPage() {
    const { t } = useTranslation();
    const { toasts, showError, showSuccess, showInfo, removeToast } = useToast();
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<SortState | null>([
        { key: 'client_name', direction: 'asc' },
        { key: 'project_name', direction: 'asc' }
    ]);
    const [editingAssignment, setEditingAssignment] = useState<AssignmentTableRow | null>(null);

    // --- Data State ---
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [assignments, setAssignments] = useState<AdminTaskAssignment[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Edit/Create Form State ---
    const [activeForm, setActiveForm] = useState<'client' | 'project' | 'task' | 'createClient' | 'createProject' | 'createTask' | null>(null);
    const [formInitialValues, setFormInitialValues] = useState<FormValues>({});

    // --- Delete Confirmation State ---
    const [deletingItem, setDeletingItem] = useState<{ type: 'client' | 'project' | 'task', id: string, name: string } | null>(null);

    // --- Fetch Data ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [
                fetchedClients,
                fetchedProjects,
                fetchedTasks,
                fetchedAssignments,
                fetchedUsers
            ] = await Promise.all([
                assignmentService.fetchClients(),
                assignmentService.fetchProjects(),
                assignmentService.fetchTasks(),
                assignmentService.fetchAllAssignments(),
                assignmentService.fetchPotentialEmployees()
            ]);

            setClients(fetchedClients);
            setProjects(fetchedProjects);
            setTasks(fetchedTasks);
            setAssignments(fetchedAssignments);
            setUsers(fetchedUsers);
        } catch (err) {
            const code = ERROR_CODES.ASSIGNMENT_LOAD_FAILED;
            console.error(`[${code}] Failed to fetch assignment data:`, err);
            setError(t('assignmentPage.errors.loadFailed'));
            showError({ message: t('assignmentPage.errors.loadFailed'), code });
        } finally {
            setIsLoading(false);
        }
    }, [t, showError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFormSubmit = async (values: FormValues) => {
        try {
            console.log(`Submitted ${activeForm} form:`, values);
            // TODO: Implement create/edit API calls
            showInfo(t('common.notImplemented'));
            setActiveForm(null);
        } catch (formError) {
            const code = ERROR_CODES.FORM_SUBMIT_FAILED;
            console.error(`[${code}] Form submission failed:`, formError);
            showError({ message: t('common.error') || 'An error occurred', code });
        }
    };

    const handleEditClient = (row: AssignmentTableRow) => {
        const client = clients.find(c => c.client_id === row.client_id);
        if (client) {
            setFormInitialValues({
                clientName: client.name,
                contactDetails: client.contact_info || '',
            });
            setActiveForm('client');
        }
    };

    const handleEditProject = (row: AssignmentTableRow) => {
        const project = projects.find(p => p.project_id === row.project_id);
        if (project) {
            setFormInitialValues({
                projectName: project.name,
                clientId: String(project.client_id),
                projectDuration: { start: project.start_date || '', end: project.end_date || '' },
                description: project.description || '',
            });
            setActiveForm('project');
        }
    };

    const handleEditTask = (row: AssignmentTableRow) => {
        const task = tasks.find(t => t.task_id === row.task_id);
        if (task) {
            setFormInitialValues({
                taskTitle: task.name,
                projectId: String(task.project_id),
                assignedTo: '', // Logic needed if we want to pre-fill single assignee
                dueDate: task.end_date || '',
                description: task.description || '',
            });
            setActiveForm('task');
        }
    };

    const handleDeleteClick = (type: 'client' | 'project' | 'task', id: string, name: string) => {
        setDeletingItem({ type, id, name });
    };

    const handleConfirmDelete = () => {
        try {
            if (!deletingItem) return;
            // TODO: Implement delete API calls
            console.log(`Deleted ${deletingItem.type} with id: ${deletingItem.id}`);
            showInfo(t('common.notImplemented'));
            setDeletingItem(null);
        } catch (deleteError) {
            const code = ERROR_CODES.DELETE_FAILED;
            console.error(`[${code}] Delete failed:`, deleteError);
            showError({ message: t('common.error') || 'An error occurred', code });
        }
    };

    // --- Data Aggregation (Raw Rows) ---
    const rawRows = useMemo(() => {
        if (!tasks) return [];
        return tasks.map(task => {
            const project = projects.find(p => p.project_id === task.project_id);
            const client = project ? clients.find(c => c.client_id === project.client_id) : null;

            // Find active assignments for this task
            // Assignments from backend are AdminTaskAssignment[]
            const taskAssignments = (assignments || []).filter(
                a => a.task_id === task.task_id && a.active
            );

            // Map assignments to PersonChip
            const assignees: PersonChip[] = taskAssignments.map(assignment => {
                const user = (users || []).find(u => u.user_id === assignment.user_id);
                return {
                    id: String(assignment.user_id),
                    name: user ? user.full_name : t('common.unknownUser')
                };
            });

            return {
                id: String(task.task_id),
                task_id: task.task_id,
                client_id: client ? client.client_id : '',
                project_id: project ? project.project_id : '',
                client_name: client ? client.name : t('common.unknown'),
                project_name: project ? project.name : t('common.unknown'),
                task_name: task.name,
                assignees
            };
        });
    }, [tasks, projects, clients, assignments, users, t]);

    // --- Search Logic (Reusable) ---
    const { searchQuery, setSearchQuery, filteredData } = useTableSearch(rawRows, ['client_name', 'project_name', 'task_name']);

    // Reset pagination when search/data changes
    useEffect(() => {
        setPage(1);
    }, [searchQuery, rawRows.length]);


    // --- Sort & Paginate Filtered Data ---
    const { data, totalItems, totalPages } = useMemo(() => {
        const processedData = [...filteredData];

        // 1. Sort
        if (sort && sort.length > 0) {
            processedData.sort((a, b) => {
                for (const sortItem of sort) {
                    const key = sortItem.key as keyof AssignmentTableRow;
                    const valA = String(a[key] || '');
                    const valB = String(b[key] || '');

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
    }, [filteredData, page, sort]);

    // Data for the form: All potential available employees
    const potentialEmployees: EmployeeRow[] = useMemo(() => {
        return (users || []).map(user => ({
            id: String(user.user_id),
            fullName: user.full_name,
            type: user.role === UserRole.ADMIN ? t('employeesPage.roles.admin') : t('employeesPage.roles.employee'),
            role: user.job_title || ''
        }));
    }, [users, t]);

    const handleAssignmentSubmit = async (selectedRows: EmployeeRow[]) => {
        if (!editingAssignment) return;
        try {
            const employeeIds = selectedRows.map(r => r.id);
            await assignmentService.assignEmployees(editingAssignment.task_id, employeeIds);
            showSuccess(t('assignmentPage.success.assigned'));
            setEditingAssignment(null);
            fetchData(); // Refresh data to show updates
        } catch (assignError) {
            const code = ERROR_CODES.ASSIGNMENT_FAILED;
            console.error(`[${code}] Assignment failed:`, assignError);
            showError({ message: t('assignmentPage.errors.assignFailed'), code });
        }
    };

    // Columns definition
    const columns: TableColumnDef<AssignmentTableRow>[] = [
        {
            key: 'client_name',
            header: t('assignmentPage.tableHeaders.clientName'),
            type: 'text',
            sortable: true,
            disableSortClearing: true,
            width: '20%',
        },
        {
            key: 'project_name',
            header: t('assignmentPage.tableHeaders.projectName'),
            type: 'text',
            sortable: true,
            disableSortClearing: true,
            width: '20%',
        },
        {
            key: 'task_name',
            header: t('assignmentPage.tableHeaders.taskName'),
            type: 'text',
            sortable: true,
            width: '20%',
        },
        {
            key: 'assignees',
            header: t('assignmentPage.tableHeaders.assignees'),
            type: 'tags',
            width: '25%',
            accessor: (row) => row.assignees
        },
        {
            key: 'actions',
            header: t('common.actions'),
            type: 'actions',
            width: '15%',
        }
    ];

    const createDropdownOptions = useMemo(() => [
        { id: 'client', label: t('createMenu.options.addClient'), onSelect: () => { setFormInitialValues({}); setActiveForm('createClient'); } },
        { id: 'project', label: t('createMenu.options.addProject'), onSelect: () => { setFormInitialValues({}); setActiveForm('createProject'); } },
        { id: 'task', label: t('createMenu.options.addTask'), onSelect: () => { setFormInitialValues({}); setActiveForm('createTask'); } },
    ], [t]);

    if (error && !data.length) {
        return <div className="assignment-page-error">{error} <button onClick={fetchData}>{t('common.retry')}</button></div>;
    }

    return (
        <div className="assignment-page">
            <div className="assignment-page-header">
                {/* Title Section (Right/Start) */}
                <div className="page-header-title-group">
                    <h1>{t('assignmentPage.title')}</h1>
                    <p>{t('assignmentPage.subtitle')}</p>
                </div>

                {/* Actions/Search Section (Left/End) */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <TableSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t('assignmentPage.searchBarHint')}
                    />
                    <CreateDropdownMenu
                        label={t('createMenu.title')}
                        options={createDropdownOptions}
                    />
                </div>
            </div>

            <TableShell
                tableId="assignments-table"
                data={data}
                columns={columns}
                getRowId={(row) => row.id}
                pagination={{
                    page,
                    pageSize: 11,
                    totalItems,
                    totalPages
                }}
                onPageChange={setPage}
                sort={sort}
                onSortChange={setSort}
                isLoading={isLoading}
                rowActions={{
                    showEdit: true,
                    showDelete: true,
                    editOptions: [
                        { label: t('assignmentPage.actions.editClient'), onClick: (row) => handleEditClient(row) },
                        { label: t('assignmentPage.actions.editProject'), onClick: (row) => handleEditProject(row) },
                        { label: t('assignmentPage.actions.editTask'), onClick: (row) => handleEditTask(row) },
                        {
                            label: t('assignmentPage.actions.editAssignment'),
                            onClick: (row) => setEditingAssignment(row)
                        },
                    ],
                    deleteOptions: [
                        { label: t('assignmentPage.actions.deleteClient'), onClick: (row) => handleDeleteClick('client', String(row.client_id), row.client_name) },
                        { label: t('assignmentPage.actions.deleteProject'), onClick: (row) => handleDeleteClick('project', String(row.project_id), row.project_name) },
                        { label: t('assignmentPage.actions.deleteTask'), onClick: (row) => handleDeleteClick('task', String(row.task_id), row.task_name) },
                    ]
                }}
            />

            {editingAssignment && (
                <TaskEmployeeAssignmentForm
                    contextPath={{
                        client: { id: String(editingAssignment.client_id), name: editingAssignment.client_name },
                        project: { id: String(editingAssignment.project_id), name: editingAssignment.project_name },
                        task: { id: String(editingAssignment.task_id), name: editingAssignment.task_name }
                    }}
                    rows={potentialEmployees}
                    initialSelectedIds={editingAssignment.assignees.map(a => a.id)}
                    onSubmit={handleAssignmentSubmit}
                    onClose={() => setEditingAssignment(null)}
                />
            )}

            {/* Edit Forms */}
            {activeForm === 'client' && (
                <FormShell
                    {...editClientForm}
                    initialValues={formInitialValues}
                    onClose={() => setActiveForm(null)}
                    onSubmit={handleFormSubmit}
                />
            )}

            {activeForm === 'project' && (
                <FormShell
                    {...editProjectForm}
                    initialValues={formInitialValues}
                    onClose={() => setActiveForm(null)}
                    onSubmit={handleFormSubmit}
                />
            )}

            {activeForm === 'task' && (
                <FormShell
                    {...editTaskForm}
                    initialValues={formInitialValues}
                    onClose={() => setActiveForm(null)}
                    onSubmit={handleFormSubmit}
                />
            )}

            {/* Create Forms */}
            {activeForm === 'createClient' && (
                <FormShell
                    {...createClientForm}
                    initialValues={{}}
                    onClose={() => setActiveForm(null)}
                    onSubmit={handleFormSubmit}
                />
            )}

            {activeForm === 'createProject' && (
                <FormShell
                    {...createProjectForm}
                    initialValues={{}}
                    onClose={() => setActiveForm(null)}
                    onSubmit={handleFormSubmit}
                />
            )}

            {activeForm === 'createTask' && (
                <FormShell
                    {...createTaskForm}
                    initialValues={{}}
                    onClose={() => setActiveForm(null)}
                    onSubmit={handleFormSubmit}
                />
            )}

            <ConfirmActionModal
                isOpen={!!deletingItem}
                title={deletingItem ? t(`confirmDelete.${deletingItem.type}.title`) : ''}
                description={deletingItem ? `${t(`confirmDelete.${deletingItem.type}.description`)} (${deletingItem.name})` : ''}
                variant={CONFIRM_VARIANTS.DANGER}
                confirmLabel={t('confirmDelete.confirmLabel')}
                cancelLabel={t('confirmDelete.cancelLabel')}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeletingItem(null)}
            />

            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </div>
    );
}
