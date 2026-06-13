import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Redirecting() {
    const router = useRouter();
    const { slug } = router.query;
    const slugStr:string = Array.isArray(slug) ? slug.join('/') : slug ?? '';
    useEffect(() => {
        if (slugStr === "不審者が出た時の対処法") {
            const root = document.querySelector("html");
            root!.innerHTML = "<body style='height: 100%; width: 100%; overflow: hidden; margin:0px; background-color: rgb(230, 230, 230);'><embed name='embed' style='position:absolute; left: 0; top: 0;'width='100%' height='100%' src='https://sakitibi.github.io/static.asakurawiki.com/docs/%E4%B8%8D%E5%AF%A9%E8%80%85%E3%81%8C%E5%87%BA%E3%81%9F%E6%99%82%E3%81%AE%E5%AF%BE%E5%87%A6%E6%B3%95.pdf' type='application/pdf' internalid='embed'></body>"
        }
    }, []);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params || {};

    const decodedSlug = slug ? decodeURIComponent(slug as string) : "";
    
    if (decodedSlug !== "不審者が出た時の対処法") {
        return {
            notFound: true
        };
    }
    return {
        props: {}
    };
};