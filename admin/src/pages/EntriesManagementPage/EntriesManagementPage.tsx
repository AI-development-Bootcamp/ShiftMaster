import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { TableShell } from '../../components/TableShell';
import { TableSearch } from '../../components/TableShell/TableSearch';
import { useTableSearch } from '../../hooks/useTableSearch';
import { TableColumnDef, SortState } from '../../components/TableShell/types';
import { Project, ProjectTimeFormatType } from '@abra-shift-master/shared';
import { mockClients } from '../../mocks/clients';
import { mockCurrentUser } from '../../mocks/users';
import { MonthLockButton, MonthLockModal } from '../../components/MonthLocks';
import { FormShell, FormValues } from '../../components/FormShell';
import { createClientForm } from '../../components/forms/createClient';
import { createProjectForm } from '../../components/forms/createProject';
import { createTaskForm } from '../../components/forms/createTask';
import { CreateDropdownMenu } from '../../components/CreateDropdownMenu/CreateDropdownMenu';
import { useTranslation } from 'react-i18next';
import { fetchProjects, updateProject } from '../../api/projectsApi';
import '../../styles/EntriesManagementPage.css';

export function EntriesManagementPage() {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<SortState | null>([
        { key: 'client_name', direction: 'asc' },
        { key: 'name', direction: 'asc' }
    ]);
    const [isMonthLockModalOpen, setIsMonthLockModalOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // --- Create Form State ---
    const [activeForm, setActiveForm] = useState<'createClient' | 'createProject' | 'createTask' | null>(null);

    const handleFormSubmit = async (values: FormValues) => {
        try {
            console.log(`Submitted ${activeForm} form:`, values);
            setActiveForm(null);
        } catch (error) {
            console.error('Form submission failed:', error);
            // Ideally trigger a notification here
        }
    };



    // Local state for projects data (will be replaced with API data in the future)
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectsError, setProjectsError] = useState<string | null>(null);

    const createDropdownOptions = useMemo(() => [
        { id: 'client', label: t('createMenu.options.addClient'), onSelect: () => setActiveForm('createClient') },
        { id: 'project', label: t('createMenu.options.addProject'), onSelect: () => setActiveForm('createProject') },
        { id: 'task', label: t('createMenu.options.addTask'), onSelect: () => setActiveForm('createTask') },
    ], [t]);

    const projectOptions = useMemo(() => {
        return projects
            .filter(p => p.active)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(p => ({ value: p.project_id, label: p.name }));
    }, [projects]);

    const loadProjects = useCallback(async () => {
        try {
            setProjectsLoading(true);
            setProjectsError(null);
            // Fetch projects including inactive ones for management
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

    // Handle radio change - updates local state and calls API
    const handleRadioChange = async ({ row, columnKey, nextValue }: {
        row: Project;
        columnKey: string;
        nextValue: string;
    }) => {
        // Optimistic update
        const originalProjects = [...projects];
        setProjects(prevProjects =>
            prevProjects.map(project =>
                project.project_id === row.project_id
                    ? { ...project, [columnKey]: nextValue as ProjectTimeFormatType }
                    : project
            )
        );

        try {
            // Only patch if value changed (TableShell/RadioCell handles this check usually, but we ensure here)
            if (row.time_format_type !== nextValue) {
                await updateProject(row.project_id, { time_format_type: nextValue as ProjectTimeFormatType });
            }
        } catch (error) {
            console.error('Failed to update project:', error);
            // Revert on failure
            setProjects(originalProjects);
            // Optional: show notification
        }
    };

    // --- Search Logic (Reusable) ---
    // Search by project name only (client_name is not on Project type)
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
                const client = mockClients.find(c => c.client_id === row.client_id);
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
                        valA = mockClients.find(c => c.client_id === a.client_id)?.name || '';
                        valB = mockClients.find(c => c.client_id === b.client_id)?.name || '';
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
    }, [page, sort, filteredData]);

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
                        user={mockCurrentUser}
                        onClick={() => setIsMonthLockModalOpen(true)}
                    />
                    <MonthLockModal
                        isOpen={isMonthLockModalOpen}
                        onClose={() => setIsMonthLockModalOpen(false)}
                        buttonRef={buttonRef}
                    />
                </div>
            </div>

            {projectsError && (
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
            )}

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
                isLoading={projectsLoading}
            />

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
                    fields={createTaskForm.fields.map(f => f.id === 'projectId' ? { ...f, options: projectOptions } : f)}
                    initialValues={{}}
                    onClose={() => setActiveForm(null)}
                    onSubmit={handleFormSubmit}
                />
            )}
        </div>
    );
}

