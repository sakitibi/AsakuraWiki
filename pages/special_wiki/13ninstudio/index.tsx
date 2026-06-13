import { GetServerSideProps } from "next";

export default function Redirecting() {
    // サーバー側でリダイレクトされるため、基本的にはこのコンポーネントはレンダリングされません。
    // 万が一のフォールバックとしてのみ機能します。
    return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return {
        redirect: {
            destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/wiki/13ninstudio`,
            permanent: false,
        },
    };
};