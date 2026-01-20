import { useState, useLayoutEffect, useRef } from 'react';
import { PersonChip } from '../../types';

interface TagsCellProps {
    tags: PersonChip[];
}

export function TagsCell({ tags }: TagsCellProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(tags?.length || 0);

    useLayoutEffect(() => {
        if (!tags || tags.length === 0) return;

        const calculateVisible = () => {
            if (!containerRef.current || !measureRef.current) return;

            const containerWidth = containerRef.current.clientWidth;
            const tagNodes = measureRef.current.children;
            const gap = 4; // defined in CSS
            const pillWidthEstimate = 32; // Approx width of "+99" pill with padding

            let currentWidth = 0;
            let count = 0;

            for (let i = 0; i < tagNodes.length; i++) {
                const tagWidth = (tagNodes[i] as HTMLElement).offsetWidth;

                // Check if adding this tag exceeds space
                // If it's the LAST tag, we don't need the pill space
                // If it's NOT the last tag, we need to reserve space for pill in case we truncate later?
                // Actually, simple logic:
                // If (currentWidth + tagWidth) <= containerWidth, we accept it.
                // BUT if we stop here and it's not the last tag, we need to back-track to fit the pill.

                if (currentWidth + tagWidth > containerWidth) {
                    // Overflow triggered.
                    // We need to ensure we have space for the pill.
                    // If the pill doesn't fit in the remaining space of the PREVIOUS accepted state, we might need to remove more.
                    // Let's assume the previous loop iteration left enough space? Not guaranteed.

                    // Re-calc: Find index where (Sum(0..i) + Gap*i + PillWidth) <= ContainerWidth
                    break;
                }

                currentWidth += tagWidth + gap;
                count++;
            }

            // Now we have 'count' = number of tags that PURELY fit.
            // If count < tags.length, we must show a pill.
            // Does the pill fit? 
            // If we truncated, we need to check: 
            // Width(tags[0..count-1]) + Pill <= Container?

            if (count < tags.length) {
                let widthWithPill = 0;
                // Recalculate accumulation including pill
                let fitCount = 0;
                for (let i = 0; i < tagNodes.length; i++) {
                    const tagWidth = (tagNodes[i] as HTMLElement).offsetWidth;
                    // Check if: currentWidth + tagWidth + Gap + PillWidth <= Container
                    if (widthWithPill + tagWidth + gap + pillWidthEstimate <= containerWidth) {
                        widthWithPill += tagWidth + gap;
                        fitCount++;
                    } else {
                        break;
                    }
                }
                setVisibleCount(fitCount);
            } else {
                setVisibleCount(tags.length);
            }
        };

        calculateVisible();

        // Optional: Re-calculate on window resize
        window.addEventListener('resize', calculateVisible);
        return () => window.removeEventListener('resize', calculateVisible);

    }, [tags]);

    if (!tags || tags.length === 0) {
        return <div className="table-shell__tags--empty" />;
    }

    const hasOverflow = visibleCount < tags.length;
    // Ensure logical bounds
    const safeVisibleCount = Math.max(0, Math.min(visibleCount, tags.length));

    // Logic: 
    // If hasOverflow, show safeVisibleCount tags + Pill.
    // The pill will show "+(total - safeVisibleCount)".
    // BUT exception: if safeVisibleCount == 0, show pill "+N" (if possible) or nothing?

    const visibleTags = tags.slice(0, safeVisibleCount);
    const hiddenTags = tags.slice(safeVisibleCount);
    const overflowCount = hiddenTags.length;
    const hiddenNames = hiddenTags.map(t => t.name).join(', ');

    return (
        <div className="table-shell__tags" ref={containerRef}>
            {visibleTags.map((tag) => (
                <span key={tag.id} className="table-shell__tag">
                    {tag.name}
                </span>
            ))}
            {hasOverflow && (
                <div className="table-shell__tag table-shell__tag--overflow">
                    <span>+{overflowCount}</span>
                    <div className="table-shell__tooltip">
                        {hiddenNames}
                    </div>
                </div>
            )}

            {/* Hidden Measurement Layer */}
            <div
                ref={measureRef}
                style={{
                    position: 'absolute',
                    visibility: 'hidden',
                    height: 0,
                    top: 0,
                    left: 0,
                    display: 'flex',
                    gap: '4px',
                    width: 'max-content' // Ensure elements don't wrap in measurement
                }}
            >
                {tags.map((tag) => (
                    <span key={tag.id} className="table-shell__tag">
                        {tag.name}
                    </span>
                ))}
            </div>
        </div>
    );
}
