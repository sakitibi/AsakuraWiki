import React from 'react';

const containerStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1em',
    background: '#f5f5f5',
    marginBottom: '1.5em',
};

export default function SelContainer({ children }: { children: React.ReactNode }) {
    return <div className="sel-container">{children}</div>;
}