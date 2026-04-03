import { ClientError } from "@/pages";
import Head from "next/head";

interface ClientErrorUIProps{
    readonly clientError: ClientError
}

export default function ClientErrorUI({
    clientError
}: ClientErrorUIProps){
    return (
        <>
            <Head>
                <title>Client Error</title>
            </Head>
            <main style={{ padding: '2rem', color: 'red' }}>
                <h1>Client-side Exception</h1>
                <p>{clientError.message}</p>
                {clientError.stack && (
                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                        {clientError.stack}
                    </pre>
                )}
            </main>
        </>
    );
}