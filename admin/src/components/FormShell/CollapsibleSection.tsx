import { useState, useRef, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface CollapsibleSectionProps {
    children: ReactNode;
    isVisible: boolean;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
}

/**
 * CollapsibleSection - Wrapper for conditional fields with slide animation
 */
export function CollapsibleSection({
    children,
    isVisible,
    collapsible = false,
    defaultCollapsed = false,
}: CollapsibleSectionProps) {
    const { t } = useTranslation();
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [height, setHeight] = useState<number | 'auto'>('auto');
    const contentRef = useRef<HTMLDivElement>(null);

    // Update height for animation
    useEffect(() => {
        if (!isVisible) {
            setHeight(0);
            return;
        }

        if (isCollapsed) {
            setHeight(0);
        } else if (contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
        }
    }, [isVisible, isCollapsed]);

    // Don't render if not visible and fully collapsed
    if (!isVisible && height === 0) {
        return null;
    }

    const showToggle = isVisible && collapsible;

    return (
        <div className={`collapsible-section ${isCollapsed ? 'collapsible-section--collapsed' : ''}`}>
            {showToggle && (
                <button
                    type="button"
                    className="collapsible-section__toggle"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-expanded={!isCollapsed}
                >
                    <span className={`collapsible-section__icon ${isCollapsed ? '' : 'collapsible-section__icon--expanded'}`}>
                        ▶
                    </span>
                    <span>{isCollapsed ? t('common.show') : t('common.hide')}</span>
                </button>
            )}
            <div
                className="collapsible-section__content"
                style={{
                    height: height === 'auto' ? 'auto' : `${height}px`,
                    overflow: 'hidden',
                    transition: 'height 0.3s ease-in-out',
                }}
            >
                <div ref={contentRef}>
                    {children}
                </div>
            </div>
        </div>
    );
}
