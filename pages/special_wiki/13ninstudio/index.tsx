import Head from "next/head";
import { useEffect } from "react";

export default function Redirecting(){
    const Redirect = () => {
        if(typeof location !== "undefined" && typeof window !== "undefined"){
            location.href = "/wiki/13ninstudio";
        }
    }
    useEffect(() => {
        Redirect();
    }, []);
    return(
        <>
            <Head>
                <title>Redirecting..</title>
            </Head>
            <button onClick={Redirect}><span>リダイレクト</span></button>
        </>
    )
}