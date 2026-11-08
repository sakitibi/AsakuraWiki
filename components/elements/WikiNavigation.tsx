import React from 'react';

interface WikiNavigationProps {
    sidebar?: unknown;
    menubar?: unknown;
    parsedSidebar: React.ReactNode[] | null;
    parsedMenubar: React.ReactNode[] | null;
}

export const WikiNavigation: React.FC<WikiNavigationProps> = ({
    sidebar,
    menubar,
    parsedSidebar,
    parsedMenubar,
}) => {
    return (
        <>
            <aside style={{ width: '170px', padding: '1rem' }} className="columnRight">
                {sidebar === undefined && 'SideBar 読み込み中…'}
                {sidebar !== undefined && sidebar === null && 'SideBar は存在しません'}
                {parsedSidebar?.map((node, i) => (
                    <React.Fragment key={i}>{node}</React.Fragment>
                ))}
            </aside>
            <aside style={{ width: '172px', padding: '1rem' }} className="columnLeft">
                {menubar === undefined && 'MenuBar 読み込み中…'}
                {menubar !== undefined && menubar === null && 'MenuBar は存在しません'}
                {parsedMenubar?.map((node, i) => (
                    <React.Fragment key={i}>{node}</React.Fragment>
                ))}
            </aside>
        </>
    );
};