import { useState, useMemo } from 'react';
import { TableShell } from '../../components/TableShell';
import { TableColumnDef, SortState, PersonChip } from '../../components/TableShell/types';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
                    name: user ? user.full_name : t('common.unknownUser')
                };
            });

            return {
                id: String(task.task_id),
                task_id: task.task_id, // Keep number for reference if needed
                client_name: client ? client.name : t('common.unknown'),
                project_name: project ? project.name : t('common.unknown'),
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
    }, [page, sort, t]);

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

    return (
        <div className="assignment-page">
            <div className="assignment-page-header">
                <h1>{t('assignmentPage.title')}</h1>
                <p>{t('assignmentPage.subtitle')}</p>
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
                        { label: t('assignmentPage.actions.editClient'), onClick: () => console.log(1) },
                        { label: t('assignmentPage.actions.editProject'), onClick: () => console.log(2) },
                        { label: t('assignmentPage.actions.editTask'), onClick: () => console.log(3) },
                        { label: t('assignmentPage.actions.editAssignment'), onClick: () => console.log(4) },
                    ],
                    deleteOptions: [
                        { label: t('assignmentPage.actions.deleteClient'), onClick: () => console.log(11) },
                        { label: t('assignmentPage.actions.deleteProject'), onClick: () => console.log(12) },
                        { label: t('assignmentPage.actions.deleteTask'), onClick: () => console.log(13) },
                    ]
                }}
            />
        </div>
    );
}
