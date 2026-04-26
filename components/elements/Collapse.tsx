import { useState } from "react";
import { Collapse } from "react-bootstrap";

interface CollapseItemProps {
    title: string;
    children: React.ReactNode;
    eventKey: string;
    isStrong?: boolean;
}

export default function CollapseItem ({ title, children, eventKey, isStrong }: CollapseItemProps) {
    const [open, setOpen] = useState(false);

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
                    onClick={(e) => {
                        e.preventDefault(); // aタグのデフォルト挙動を防止
                        setOpen(!open);
                    }}
                    aria-controls={eventKey}
                    aria-expanded={open}
                    className={open ? "" : "collapsed"}
                >
                    {isStrong ? (
                        <strong>{title}</strong>
                    ) : (
                        <>{title}</>
                    )}
                    <i className={`fa-duotone fa-regular fa-caret-${open ? 'up' : 'down'} fa-fw`}></i>
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