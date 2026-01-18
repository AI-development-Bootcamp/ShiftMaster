import React, { useState } from 'react';
import './MultiTags.css';

interface MultiTagsProps {
    /** People represented by this counter chip */
    people: Array<{
        id: string;   // stable identifier (future userId)
        name: string; // full name shown in tooltip
    }>;

    /** Optional: disables tooltip opening */
    disabled?: boolean;
}

export const MultiTags: React.FC<MultiTagsProps> = ({ people, disabled = false }) => {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const count = people.length;

    if (count === 0) {
        return null;
    }

    const handleMouseEnter = () => {
        if (!disabled) {
            setIsTooltipVisible(true);
        }
    };

    const handleMouseLeave = () => {
        setIsTooltipVisible(false);
    };

    const handleFocus = () => {
        if (!disabled) {
            setIsTooltipVisible(true);
        }
    };

    const handleBlur = () => {
        setIsTooltipVisible(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsTooltipVisible(false);
        }
    };

    return (
        <div className="multitags-container">
            <div
                className={`multitag-chip ${disabled ? 'disabled' : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                tabIndex={disabled ? -1 : 0}
                aria-describedby={isTooltipVisible ? 'multitags-tooltip' : undefined}
            >
                {count}+
            </div>

            {isTooltipVisible && (
                <div
                    id="multitags-tooltip"
                    className="multitag-tooltip"
                    role="tooltip"
                >
                    {people.map(p => p.name).join(', ')}
                    <div className="tooltip-caret" />
                </div>
            )}
        </div>
    );
};
