import Head from "next/head";

export default function Redirecting(){
    const Redirect = () => {
        location.href = "/wiki/13ninstudio";
    }
    return(
        <>
            <Head>
                <title>Redirecting..</title>
            </Head>
            <button onClick={Redirect}><span>リダイレクト</span></button>
        </>
    )
}