import { TablePaginationConfig } from '../types';

interface TableFooterProps {
    pagination: TablePaginationConfig;
    onPageChange: (page: number) => void;
}

export function TableFooter({ pagination, onPageChange }: TableFooterProps) {
    const { page, totalPages } = pagination;

    const handlePrev = () => {
        if (page > 1) {
            onPageChange(page - 1);
        }
    };

    const handleNext = () => {
        if (page < totalPages) {
            onPageChange(page + 1);
        }
    };

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: number[] = [];
        const maxVisible = 5;

        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    return (
        <div className="table-shell__footer">
            <button
                className="table-shell__footer-btn"
                onClick={handlePrev}
                disabled={page <= 1}
                aria-label="עמוד קודם"
            >
                ‹
            </button>

            {getPageNumbers().map((pageNum) => (
                <button
                    key={pageNum}
                    className={`table-shell__footer-btn ${pageNum === page ? 'table-shell__footer-btn--active' : ''}`}
                    onClick={() => onPageChange(pageNum)}
                    aria-current={pageNum === page ? 'page' : undefined}
                >
                    {pageNum}
                </button>
            ))}

            <button
                className="table-shell__footer-btn"
                onClick={handleNext}
                disabled={page >= totalPages}
                aria-label="עמוד הבא"
            >
                ›
            </button>

            <span className="table-shell__page-info">
                עמוד {page} מתוך {totalPages}
            </span>
        </div>
    );
}
