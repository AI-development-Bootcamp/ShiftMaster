import { useState, useMemo } from 'react';
import { TableShell } from '../../components/TableShell';
import { TableColumnDef, SortState } from '../../components/TableShell/types';
import { Project, ProjectTimeFormatType } from '@abra-shift-master/shared';
import { mockProjects } from '../../mocks/projects';
import { mockClients } from '../../mocks/clients';
import '../../styles/EntriesManagementPage.css';

export function EntriesManagementPage() {
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<SortState | null>([
        { key: 'client_name', direction: 'asc' },
        { key: 'name', direction: 'asc' }
    ]);

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

    // Columns definition
    const columns: TableColumnDef<Project>[] = [
        {
            key: 'client_name',
            header: 'שם לקוח',
            type: 'text',
            sortable: true,
            disableSortClearing: true,
            width: '30%',
            accessor: (row) => {
                const client = mockClients.find(c => c.client_id === row.client_id);
                return client ? client.name : 'לא ידוע';
            }
        },
        {
            key: 'name',
            header: 'שם הפרויקט',
            type: 'text',
            sortable: true,
            disableSortClearing: true,
            width: '30%',
            accessor: (row) => row.name,
        },
        {
            key: 'time_format_type',
            header: 'סוג הדיווח',
            type: 'radio',
            width: '40%',
            accessor: (row) => row.time_format_type,
            radioOptions: [
                { value: ProjectTimeFormatType.SUM, label: 'סכום שעות' },
                { value: ProjectTimeFormatType.START_END, label: 'כניסה ויציאה' }
            ]
        }
    ];

    // Data processing (Sorting, Pagination)
    const { data, totalItems, totalPages } = useMemo(() => {
        let processedData = [...projects];

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
        const pageSize = 10;
        const totalItems = processedData.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const paginatedData = processedData.slice(startIndex, startIndex + pageSize);

        return { data: paginatedData, totalItems, totalPages };
    }, [page, sort, projects]);

    return (
        <div className="entries-management-page">
            <div className="entries-management-page-header">
                <h1>ניהול רשומות</h1>
                <p>כאן יופיע מסך ניהול הרשומות והנתונים.</p>
            </div>

            <TableShell
                tableId="projects-table"
                data={data}
                columns={columns}
                getRowId={(row) => String(row.project_id)}
                pagination={{
                    page,
                    pageSize: 10,
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

