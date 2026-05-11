import { supabaseClient } from "@/lib/supabaseClient";
import Head from "next/head";
import { useEffect } from "react";

export default function Redirecting(){
    const Redirect = async () => {
        const session = await supabaseClient.auth.getSession();
        const token = session?.data?.session?.access_token
        if(typeof location !== "undefined" && typeof window !== "undefined"){
            location.href = `https://sakitibi.github.io/13nin.com/staff_credits?login=${token}`;
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