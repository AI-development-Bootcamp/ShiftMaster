import React from 'react';
import './Tag.css';

interface TagProps {
    /** Stable identifier (future: userId). Not rendered, for keys/tests */
    id?: string;
    /** Full name to display */
    name: string;
}

export const Tag: React.FC<TagProps> = ({ name }) => {
    return (
        <div className="tag-component" dir="rtl">
            {name}
        </div>
    );
};
