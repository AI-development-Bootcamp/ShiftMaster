import { useState, useMemo, useRef, useEffect } from 'react';
import { TableShell } from '../../components/TableShell';
import { TableSearch } from '../../components/TableShell/TableSearch';
import { useTableSearch } from '../../hooks/useTableSearch';
import { TableColumnDef, SortState } from '../../components/TableShell/types';
import { Project, ProjectTimeFormatType } from '@abra-shift-master/shared';
import { mockProjects } from '../../mocks/projects';
import { mockClients } from '../../mocks/clients';
import { mockCurrentUser } from '../../mocks/users';
import { MonthLockButton, MonthLockModal } from '../../components/MonthLocks';
import { useTranslation } from 'react-i18next';
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
                <div className="month-lock-button-container">
                    {/* Visual Order RTL: [Search] [Button] (Button is Leftmost) */}
                    <TableSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t('entriesPage.searchBarHint')}
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
                isLoading={false}
            />
        </div>
    );
}

