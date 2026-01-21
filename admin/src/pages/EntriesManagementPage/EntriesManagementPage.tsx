import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { TableShell } from '../../components/TableShell';
import { TableSearch } from '../../components/TableShell/TableSearch';
import { useTableSearch } from '../../hooks/useTableSearch';
import { TableColumnDef, SortState } from '../../components/TableShell/types';
import { Client, Project, ProjectTimeFormatType } from '@abra-shift-master/shared';
import { mockProjects } from '../../mocks/projects';
import { mockCurrentUser } from '../../mocks/users';
import { MonthLockButton, MonthLockModal } from '../../components/MonthLocks';
import { FormShell, FormValues } from '../../components/FormShell';
import { createClientForm } from '../../components/forms/createClient';
import { createProjectForm } from '../../components/forms/createProject';
import { createTaskForm } from '../../components/forms/createTask';
import { CreateDropdownMenu } from '../../components/CreateDropdownMenu/CreateDropdownMenu';
import { useTranslation } from 'react-i18next';
import { fetchClients, createClient } from '../../api/clientsApi';
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

    // --- Client Data State (from API) ---
    const [clients, setClients] = useState<Client[]>([]);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [clientsError, setClientsError] = useState<string | null>(null);

    // --- Create Form State ---
    const [activeForm, setActiveForm] = useState<'createClient' | 'createProject' | 'createTask' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                await createClient({
                    name: values.clientName as string,
                    contact_info: values.contactDetails as string || undefined,
                });
                await loadClients(); // Refresh client list
            } else {
                console.log(`Submitted ${activeForm} form:`, values);
            }

            setActiveForm(null);
        } catch (error) {
            console.error('Form submission failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const createDropdownOptions = useMemo(() => [
        { id: 'client', label: t('createMenu.options.addClient'), onSelect: () => setActiveForm('createClient') },
        { id: 'project', label: t('createMenu.options.addProject'), onSelect: () => setActiveForm('createProject') },
        { id: 'task', label: t('createMenu.options.addTask'), onSelect: () => setActiveForm('createTask') },
    ], [t]);

    // Local state for projects data (will be replaced with API data in the future)
    const [projects, setProjects] = useState<Project[]>(mockProjects);

    // Handle radio change - updates local state (TODO: integrate with API)
    const handleRadioChange = ({ row, columnKey, nextValue }: {
        row: Project;
        columnKey: string;
        nextValue: string;
    }) => {
        setProjects(prevProjects =>
            prevProjects.map(project =>
                project.project_id === row.project_id
                    ? { ...project, [columnKey]: nextValue as ProjectTimeFormatType }
                    : project
            )
        );

        // TODO: Call API to update project in database
        console.log('Radio Change (local update):', {
            projectId: row.project_id,
            projectName: row.name,
            field: columnKey,
            newValue: nextValue
        });
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
                isLoading={clientsLoading}
            />

            {/* Create Forms */}
            {activeForm === 'createClient' && (
                <FormShell
                    {...createClientForm}
                    initialValues={{}}
                    onClose={() => setActiveForm(null)}
                    onSubmit={handleFormSubmit}
                    isSubmitting={isSubmitting}
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
                    isSubmitting={isSubmitting}
                />
            )}

            {activeForm === 'createTask' && (
                <FormShell
                    {...createTaskForm}
                    initialValues={{}}
                    onClose={() => setActiveForm(null)}
                    onSubmit={handleFormSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}

