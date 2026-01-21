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
import { Client, UserRole } from '@abra-shift-master/shared';

import { mockProjects, mockTasks } from '../../mocks/projects';
import { mockUsers } from '../../mocks/users';
import { mockAdminTaskAssignments } from '../../mocks/adminTaskAssignments';
import { fetchClients, createClient, updateClient, deleteClient } from '../../api/clientsApi';
import '../../styles/AssignmentPage.css';

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
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<SortState | null>([
        { key: 'client_name', direction: 'asc' },
        { key: 'project_name', direction: 'asc' }
    ]);
    const [editingAssignment, setEditingAssignment] = useState<AssignmentTableRow | null>(null);

    // --- Client Data State (from API) ---
    const [clients, setClients] = useState<Client[]>([]);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [clientsError, setClientsError] = useState<string | null>(null);
    const [editingClientId, setEditingClientId] = useState<string | null>(null);

    // --- Edit/Create Form State ---
    const [activeForm, setActiveForm] = useState<'client' | 'project' | 'task' | 'createClient' | 'createProject' | 'createTask' | null>(null);
    const [formInitialValues, setFormInitialValues] = useState<FormValues>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Delete Confirmation State ---
    const [deletingItem, setDeletingItem] = useState<{ type: 'client' | 'project' | 'task', id: string, name: string } | null>(null);

    // --- Fetch Clients from API ---
    const loadClients = useCallback(async () => {
        try {
            setClientsLoading(true);
            setClientsError(null);
            const response = await fetchClients({ include_inactive: false });
            setClients(response.clients);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
            setClientsError(t('errors.failedToLoadClients'));
        } finally {
            setClientsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadClients();
    }, [loadClients]);

    const handleFormSubmit = async (values: FormValues) => {
        try {
            setIsSubmitting(true);

            if (activeForm === 'createClient') {
                // Create new client
                await createClient({
                    name: values.clientName as string,
                    contact_info: values.contactDetails as string || undefined,
                });
                await loadClients(); // Refresh client list
            } else if (activeForm === 'client' && editingClientId) {
                // Update existing client
                await updateClient(editingClientId, {
                    name: values.clientName as string,
                    contact_info: values.contactDetails as string || undefined,
                });
                await loadClients(); // Refresh client list
            } else {
                // Handle other forms (project, task) - still using console.log for now
                console.log(`Submitted ${activeForm} form:`, values);
            }

            setActiveForm(null);
            setEditingClientId(null);
        } catch (error) {
            console.error(`Failed to submit ${activeForm} form:`, error);
            // TODO: Show error to user
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClient = (row: AssignmentTableRow) => {
        const client = clients.find(c => c.client_id === row.client_id);
        if (client) {
            setFormInitialValues({
                clientName: client.name,
                contactDetails: client.contact_info || '',
            });
            setEditingClientId(client.client_id);
            setActiveForm('client');
        }
    };

    const handleEditProject = (row: AssignmentTableRow) => {
        const project = mockProjects.find(p => p.project_id === row.project_id);
        if (project) {
            setFormInitialValues({
                projectName: project.name,
                clientId: String(project.client_id),
                projectDuration: { start: project.start_date || '', end: '' }, // End date missing in mock
                description: project.description || '',
            });
            setActiveForm('project');
        }
    };

    const handleEditTask = (row: AssignmentTableRow) => {
        const task = mockTasks.find(t => t.task_id === row.task_id);
        if (task) {
            setFormInitialValues({
                taskTitle: task.name,
                projectId: String(task.project_id),
                assignedTo: '',
                dueDate: '',
                description: task.description || '',
            });
            setActiveForm('task');
        }
    };

    const handleDeleteClick = (type: 'client' | 'project' | 'task', id: string, name: string) => {
        setDeletingItem({ type, id, name });
    };

    const handleConfirmDelete = async () => {
        if (!deletingItem) return;

        try {
            setIsSubmitting(true);

            if (deletingItem.type === 'client') {
                await deleteClient(deletingItem.id);
                await loadClients(); // Refresh client list
            } else {
                // Handle other deletes (project, task) - still using console.log for now
                console.log(`Deleted ${deletingItem.type} with id: ${deletingItem.id}`);
            }

            setDeletingItem(null);
        } catch (error) {
            console.error(`Failed to delete ${deletingItem.type}:`, error);
            // TODO: Show error to user
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Data Aggregation (Raw Rows) ---
    const rawRows = useMemo(() => {
        return mockTasks.map(task => {
            const project = mockProjects.find(p => p.project_id === task.project_id);
            const client = project ? clients.find(c => c.client_id === project.client_id) : null;

            // Find active assignments for this task
            const taskAssignments = mockAdminTaskAssignments.filter(
                a => a.task_id === task.task_id && a.active
            );

            // Map assignments to PersonChip
            const assignees: PersonChip[] = taskAssignments.map(assignment => {
                const user = mockUsers.find(u => u.user_id === assignment.user_id);
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
    }, [t, clients]);

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
        return mockUsers.map(user => ({
            id: String(user.user_id),
            fullName: user.full_name,
            type: user.role === UserRole.ADMIN ? t('employeesPage.roles.admin') : t('employeesPage.roles.employee'),
            role: user.job_title || ''
        }));
    }, [t]);

    const handleAssignmentSubmit = async (selectedRows: EmployeeRow[]) => {
        console.log('Updated assignments for task', editingAssignment?.task_name, ':', selectedRows);
        setEditingAssignment(null);
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

            {clientsError && (
                <div style={{
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {clientsError}
                </div>
            )}

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
                isLoading={clientsLoading}
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
                    {...JSON.parse(JSON.stringify(editProjectForm))} // Deep clone to avoid mutating original
                    fields={editProjectForm.fields.map(field => {
                        if (field.id === 'clientId') {
                            return {
                                ...field,
                                options: clients
                                    .filter(c => c.active)
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map(c => ({ value: c.client_id, label: c.name }))
                            };
                        }
                        return field;
                    })}
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
                    {...JSON.parse(JSON.stringify(createProjectForm))} // Deep clone to avoid mutating original
                    fields={createProjectForm.fields.map(field => {
                        if (field.id === 'clientId') {
                            return {
                                ...field,
                                options: clients
                                    .filter(c => c.active)
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map(c => ({ value: c.client_id, label: c.name }))
                            };
                        }
                        return field;
                    })}
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
                isLoading={isSubmitting}
            />
        </div>
    );
}
