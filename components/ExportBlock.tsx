import React from 'react';

interface ExportBlockProps{
    scope: 'global' | 'local';
    variables: string[];
    children?: React.ReactNode;
}

export default function ExportBlock({
    scope,
    variables,
    children,
}: ExportBlockProps) {
    return (
        <div style={{ border: '1px dashed #aaa', padding: '0.5em', marginBottom: '1em', display: 'none' }}>
            <strong>Export ({scope}):</strong> {variables.join(', ')}
            <div>{children}</div>
        </div>
    );
}
