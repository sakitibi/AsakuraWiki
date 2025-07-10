import React from 'react';

const containerStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1em',
    background: '#f5f5f5',
    marginBottom: '1.5em',
};

export default function SelRow({ children }: { children: React.ReactNode }) {
    return <tr className="sel-row">{children}</tr>;
}