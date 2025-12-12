import React from 'react';

const containerStyle: React.CSSProperties = {
    border: '0',
    borderCollapse: 'collapse',
    padding: '0',
    textAlign: 'left',
    textIndent: 'initial',
    borderSpacing: '2px'
};

export default function SelContainer({ children }: { children: React.ReactNode }) {
    return <table className="sel-container" style={containerStyle}><tbody>{children}</tbody></table>;
}