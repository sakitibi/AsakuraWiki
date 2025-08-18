import React from 'react';

interface ImportBlockProps{
    slug: string;
    page: string;
    variables: string[];
    children?: React.ReactNode;
}

export default function ImportBlock({
    slug,
    page,
    variables,
    children,
}: ImportBlockProps) {
    return (
        <div style={{ border: '1px dotted #888', padding: '0.5em', marginBottom: '1em', display: 'none' }}>
            <strong>Import from {slug}:{page}</strong> → {variables.join(', ')}
            <div>{children}</div>
        </div>
    );
}
