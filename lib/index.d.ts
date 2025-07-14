export {};

declare global {
    interface Window {
        /**
         * アナリティクス用
         * @param args
         */
        gtag: (...args: any[]) => void;
    }
}