import { useEffect } from 'react';

export function useBeforeUnload(isEdit: boolean, isDirty: boolean) {
    useEffect(() => {
        if (!isEdit || !isDirty) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            const message = "あさクラWikiから移動しますか?\n変更内容が保存されない可能性があります。";
            e.preventDefault();
            e.returnValue = message;
            return message;
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isEdit, isDirty]);
}