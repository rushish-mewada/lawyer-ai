'use client'

import { ReactNode, useRef, useLayoutEffect, useEffect, MouseEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { togglePopover, closePopover } from "@/lib/features/popoverSlice/popoverSlice";

interface PopoverProps {
    popoverId: string;
    trigger: ReactNode;
    content: ReactNode;
    contentClassName?: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
    alignOffset?: number;
    width?: number | string;
}

const Popover: React.FC<PopoverProps> = ({
    popoverId,
    trigger,
    content,
    contentClassName,
    side = 'bottom',
    align = 'center',
    sideOffset = 8,
    alignOffset = 0,
    width
}) => {
    const dispatch = useAppDispatch();
    const activePopoverId = useAppSelector((state) => state.popover.activePopoverId);
    const isOpen = activePopoverId === popoverId;

    const [position, setPosition] = useState({ top: 0, left: 0 });
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleToggle = (e: MouseEvent) => {
        e.stopPropagation();
        dispatch(togglePopover(popoverId));
    };

    useLayoutEffect(() => {
        if (isOpen && triggerRef.current && contentRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const contentHeight = contentRef.current.offsetHeight;
            const contentWidth = contentRef.current.offsetWidth;

            let newPosition = { top: 0, left: 0 };

            const sideCalculations = {
                top: () => newPosition.top = rect.top + window.scrollY - contentHeight - sideOffset,
                bottom: () => newPosition.top = rect.bottom + window.scrollY + sideOffset,
                left: () => newPosition.left = rect.left + window.scrollX - contentWidth - sideOffset,
                right: () => newPosition.left = rect.right + window.scrollX + sideOffset,
            };

            const alignCalculations = {
                start: () => {
                    if (side === 'top' || side === 'bottom') newPosition.left = rect.left + window.scrollX;
                    else newPosition.top = rect.top + window.scrollY;
                },
                center: () => {
                    if (side === 'top' || side === 'bottom') newPosition.left = rect.left + window.scrollX + rect.width / 2 - contentWidth / 2;
                    else newPosition.top = rect.top + window.scrollY + rect.height / 2 - contentHeight / 2;
                },
                end: () => {
                    if (side === 'top' || side === 'bottom') newPosition.left = rect.right + window.scrollX - contentWidth;
                    else newPosition.top = rect.bottom + window.scrollY - contentHeight;
                },
            };

            sideCalculations[side]();
            alignCalculations[align]();

            if (side === 'top' || side === 'bottom') {
                newPosition.left += alignOffset;
            } else {
                newPosition.top += alignOffset;
            }

            setPosition(newPosition);
        }
    }, [isOpen, side, align, sideOffset, alignOffset, content, width]);

    useEffect(() => {
        const handleClickOutside = (event: globalThis.MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                dispatch(closePopover());
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                dispatch(closePopover());
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, dispatch]);

    return (
        <div ref={popoverRef}>
            <div ref={triggerRef} onClick={handleToggle} className="cursor-pointer inline-block">
                {trigger}
            </div>

            {isOpen && (
                <div
                    ref={contentRef}
                    style={{
                        position: 'absolute',
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        width: width
                    }}
                    className={`z-50 ${contentClassName || ''}`}
                >
                    {content}
                </div>
            )}
        </div>
    );
};

export default Popover;