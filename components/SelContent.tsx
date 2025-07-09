import React from 'react';

type Props = {
    type?: string;
    children: React.ReactNode;
};

export default function SelContent({
    type,
    children
}: {
    type?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={`sel-content ${type ? `sel-${type}` : ''}`}>
            {children}
        </div>
    );
}