import { useState, useMemo } from 'react';
import { TableShell } from '../../components/TableShell';
import { TableColumnDef, SortState, PersonChip } from '../../components/TableShell/types';

import { mockProjects, mockTasks } from '../../mocks/projects';
import { mockClients } from '../../mocks/clients';
import { mockUsers } from '../../mocks/users';
import { mockAdminTaskAssignments } from '../../mocks/adminTaskAssignments';
import '../../styles/AssignmentPage.css';

interface AssignmentTableRow {
    id: string;
    task_id: number;
    client_name: string;
    project_name: string;
    task_name: string;
    assignees: PersonChip[];
}

export function AssignmentPage() {
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<SortState | null>([
        { key: 'client_name', direction: 'asc' },
        { key: 'project_name', direction: 'asc' }
    ]);

    // Data Aggregation
    const { data, totalItems, totalPages } = useMemo(() => {
        // Map tasks to row format
        const rows: AssignmentTableRow[] = mockTasks.map(task => {
            const project = mockProjects.find(p => p.project_id === task.project_id);
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
                    name: user ? user.full_name : 'משתמש לא ידוע'
                };
            });

            return {
                id: String(task.task_id),
                task_id: task.task_id, // Keep number for reference if needed
                client_name: client ? client.name : 'לא ידוע',
                project_name: project ? project.name : 'לא ידוע',
                task_name: task.name,
                assignees
            };
        });

        const processedData = [...rows];

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
        const pageSize = 10;
        const totalItems = processedData.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const paginatedData = processedData.slice(startIndex, startIndex + pageSize);

        return { data: paginatedData, totalItems, totalPages };
    }, [page, sort]);

    // Columns definition
    const columns: TableColumnDef<AssignmentTableRow>[] = [
        {
            key: 'client_name',
            header: 'שם לקוח',
            type: 'text',
            sortable: true,
            disableSortClearing: true,
            width: '20%',
        },
        {
            key: 'project_name',
            header: 'שם הפרויקט',
            type: 'text',
            sortable: true,
            disableSortClearing: true,
            width: '20%',
        },
        {
            key: 'task_name',
            header: 'שם משימה',
            type: 'text',
            sortable: true,
            width: '20%',
        },
        {
            key: 'assignees',
            header: 'עובדים משויכים',
            type: 'tags',
            width: '25%',
            accessor: (row) => row.assignees
        },
        {
            key: 'actions',
            header: 'פעולות',
            type: 'actions',
            width: '15%',
        }
    ];

    return (
        <div className="assignment-page">
            <div className="assignment-page-header">
                <h1> שיוך עובד למשימה</h1>
                <p>כאן תוכל לשייך עובדים למשימות מתוך פרוייקטים שונים של לקוחות</p>
            </div>

            <TableShell
                tableId="assignments-table"
                data={data}
                columns={columns}
                getRowId={(row) => row.id}
                pagination={{
                    page,
                    pageSize: 10,
                    totalItems,
                    totalPages
                }}
                onPageChange={setPage}
                sort={sort}
                onSortChange={setSort}
                isLoading={false}
                rowActions={{
                    showEdit: true,
                    showDelete: true,
                    editOptions: [
                        { label: 'ערוך לקוח', onClick: () => console.log(1) },
                        { label: 'ערוך פרוייקט', onClick: () => console.log(2) },
                        { label: 'ערוך משימה', onClick: () => console.log(3) },
                        { label: 'ערוך שיוך עובדים', onClick: () => console.log(4) },
                    ],
                    deleteOptions: [
                        { label: 'מחק לקוח', onClick: () => console.log(11) },
                        { label: 'מחק פרויקט', onClick: () => console.log(12) },
                        { label: 'מחק משימה', onClick: () => console.log(13) },
                    ]
                }}
            />
        </div>
    );
}
