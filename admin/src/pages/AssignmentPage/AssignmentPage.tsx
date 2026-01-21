import { useState, useMemo, useEffect, useCallback } from 'react';
import { TableShell } from '../../components/TableShell';
import { TableSearch } from '../../components/TableShell/TableSearch';
import { useTableSearch } from '../../hooks/useTableSearch';
import { TableColumnDef, SortState, PersonChip } from '../../components/TableShell/types';
import { TaskEmployeeAssignmentForm, EmployeeRow } from '../../components/task/TaskEmployeeAssignmentForm';
import { FormShell, FormValues, DateRangeValue } from '../../components/FormShell';
import { editClientForm, createClientForm } from '../../components/forms/createClient';
import { editProjectForm, createProjectForm } from '../../components/forms/createProject';
import { editTaskForm, createTaskForm } from '../../components/forms/createTask';
import { CreateDropdownMenu } from '../../components/CreateDropdownMenu/CreateDropdownMenu';
import { ConfirmActionModal } from '../../components/ConfirmActionModal/ConfirmActionModal';
import { CONFIRM_VARIANTS } from '../../constants/ui';
import { useTranslation } from 'react-i18next';
import { UserRole, Project } from '@abra-shift-master/shared';
import { fetchProjects, createProject, updateProject, deleteProject, CreateProjectInput, UpdateProjectInput } from '../../api/projectsApi';

import { mockTasks } from '../../mocks/projects';
import { mockClients } from '../../mocks/clients';
import { mockUsers, mockCurrentUser } from '../../mocks/users';
import { mockAdminTaskAssignments } from '../../mocks/adminTaskAssignments';
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

    // --- Projects Data State (from API) ---
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectsError, setProjectsError] = useState<string | null>(null);

    const loadProjects = useCallback(async () => {
        try {
            setProjectsLoading(true);
            setProjectsError(null);
            const { projects: fetchedProjects } = await fetchProjects({ include_inactive: true });
            setProjects(fetchedProjects);
        } catch (error) {
            console.error('Failed to load projects:', error);
            setProjectsError(t('errors.failedToLoadProjects'));
        } finally {
            setProjectsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    // --- Edit/Create Form State ---
    const [activeForm, setActiveForm] = useState<'client' | 'project' | 'task' | 'createClient' | 'createProject' | 'createTask' | null>(null);
    const [formInitialValues, setFormInitialValues] = useState<FormValues>({});
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    // --- Delete Confirmation State ---
    const [deletingItem, setDeletingItem] = useState<{ type: 'client' | 'project' | 'task', id: string, name: string } | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (values: FormValues) => {
        try {
            setIsSubmitting(true);
            if (activeForm === 'createProject') {
                const input: CreateProjectInput = {
                    client_id: values.clientId as string,
                    name: values.projectName as string,
                    description: values.description as string,
                    start_date: (values.projectDuration as DateRangeValue)?.start,
                    end_date: (values.projectDuration as DateRangeValue)?.end,
                    // Defaults for required fields not in form
                    manager_user_id: mockCurrentUser.user_id,
                    time_format_type: 'sum', // Defaulting to 'sum', logic can be refined later
                    active: true
                };
                await createProject(input);
                await loadProjects();
                setActiveForm(null);
            } else if (activeForm === 'project' && editingItemId) {
                const input: UpdateProjectInput = {
                    client_id: values.clientId as string,
                    name: values.projectName as string,
                    description: values.description as string,
                    start_date: (values.projectDuration as DateRangeValue)?.start,
                    end_date: (values.projectDuration as DateRangeValue)?.end,
                };
                await updateProject(editingItemId, input);
                await loadProjects();
                setActiveForm(null);
                setEditingItemId(null);
            } else {
                // TODO: Implement other forms
                console.log(`Submitted ${activeForm} form:`, values);
                setActiveForm(null);
            }
        } catch (error) {
            console.error('Form submission failed:', error);
            // TODO: Show error notification
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClient = (row: AssignmentTableRow) => {
        const client = mockClients.find(c => c.client_id === row.client_id);
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
            setEditingItemId(project.project_id);
            setFormInitialValues({
                projectName: project.name,
                clientId: String(project.client_id),
                projectDuration: { start: project.start_date || '', end: '' },
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
            if (deletingItem.type === 'project') {
                setIsSubmitting(true);
                await deleteProject(deletingItem.id);
                await loadProjects();
            } else {
                // Mock delete for others
                console.log(`Deleted ${deletingItem.type} with id: ${deletingItem.id}`);
            }
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setIsSubmitting(false);
            setDeletingItem(null);
        }
    };

    // --- Data Aggregation (Raw Rows) ---
    const rawRows = useMemo(() => {
        return mockTasks.map(task => {
            const project = projects.find(p => p.project_id === task.project_id);
            const client = project ? mockClients.find(c => c.client_id === project.client_id) : null;

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
    }, [t, projects]);

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

    const projectOptions = useMemo(() => {
        return projects
            .filter(p => p.active)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(p => ({ value: p.project_id, label: p.name }));
    }, [projects]);

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



            {
                projectsError && (
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
                        {projectsError}
                    </div>
                )
            }

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
                isLoading={projectsLoading}
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

            {
                editingAssignment && (
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
                )
            }

            {/* Edit Forms */}
            {
                activeForm === 'client' && (
                    <FormShell
                        {...editClientForm}
                        initialValues={formInitialValues}
                        onClose={() => setActiveForm(null)}
                        onSubmit={handleFormSubmit}
                    />
                )
            }

            {
                activeForm === 'project' && (
                    <FormShell
                        {...editProjectForm}
                        initialValues={formInitialValues}
                        onClose={() => setActiveForm(null)}
                        onSubmit={handleFormSubmit}
                    />
                )
            }

            {
                activeForm === 'task' && (
                    <FormShell
                        {...editTaskForm}
                        fields={editTaskForm.fields.map(f => f.id === 'projectId' ? { ...f, options: projectOptions } : f)}
                        initialValues={formInitialValues}
                        onClose={() => setActiveForm(null)}
                        onSubmit={handleFormSubmit}
                        isSubmitting={isSubmitting}
                    />
                )
            }

            {/* Create Forms */}
            {
                activeForm === 'createClient' && (
                    <FormShell
                        {...createClientForm}
                        initialValues={{}}
                        onClose={() => setActiveForm(null)}
                        onSubmit={handleFormSubmit}
                    />
                )
            }

            {
                activeForm === 'createProject' && (
                    <FormShell
                        {...createProjectForm}
                        initialValues={{}}
                        onClose={() => setActiveForm(null)}
                        onSubmit={handleFormSubmit}
                        isSubmitting={isSubmitting}
                    />
                )
            }

            {
                activeForm === 'createTask' && (
                    <FormShell
                        {...createTaskForm}
                        fields={createTaskForm.fields.map(f => f.id === 'projectId' ? { ...f, options: projectOptions } : f)}
                        initialValues={{}}
                        onClose={() => setActiveForm(null)}
                        onSubmit={handleFormSubmit}
                        isSubmitting={isSubmitting}
                    />
                )
            }

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
        </div >
    );
}
