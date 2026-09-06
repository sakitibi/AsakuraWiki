import { useState } from "react";
import { Collapse } from "react-bootstrap";

interface CollapseItemProps {
    title: string;
    children: React.ReactNode;
    eventKey: string;
    isStrong?: boolean;
}

export default function CollapseItem({ title, children, eventKey, isStrong }: CollapseItemProps) {
    const [open, setOpen] = useState(false);

    // Function to handle click events
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault(); // Prevent the default action of the anchor tag
        setOpen(!open);
    };

    // Function to render the title
    const renderTitle = () => {
        if (isStrong) {
            return <strong>{title}</strong>;
        }
        return <>{title}</>;
    };

    // Function to render the caret icon
    const renderCaretIcon = () => {
        return <i className={`fa-duotone fa-regular fa-caret-${open ? 'up' : 'down'} fa-fw`}></i>;
    };

    return (
        <>
            <li>
                <a
                    style={{ 
                        color: isStrong ? "#ff0000" : "inherit", 
                        textDecoration: "none", 
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px" 
                    }}
                    onClick={handleClick}
                    aria-controls={eventKey}
                    aria-expanded={open}
                    className={open ? "" : "collapsed"}
                >
                    {renderTitle()}
                    {renderCaretIcon()}
                </a>
            </li>
            
            <Collapse in={open}>
                <div id={eventKey}>
                    <div className="alert alert-dark mt-2" role="alert">
                        {children}
                    </div>
                </div>
            </Collapse>
        </>
    );
};
