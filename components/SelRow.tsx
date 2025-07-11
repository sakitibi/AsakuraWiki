import React from 'react';

export default function SelRow({ children }: { children: React.ReactNode }) {
    return <tr className="sel-row">{children}</tr>;
}