import Head from 'next/head';

export default function Custom404() {
    return (
        <>
            <Head>
                <style jsx global>
                {`
                    /*
                    * Copyright 2025-2025 13ninstudio, Inc.
                    * All Rights Reserved
                    */

                    /* css start */

                    html {
                        font-family: sans-serif;
                        font-size: 10px;
                        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                    }

                    body {
                        margin: 0;
                        background-color: #fff;
                        color: #444;
                        font-family: Noto Sans Japanese, sans-serif;
                        font-size: 14px;
                        line-height: 1.42857143;
                    }

                    h1 {
                        font-size: 2em;
                        margin: .67em 0;
                        color: inherit;
                        font-family: inherit;
                        font-weight: 500;
                        line-height: 1.1;
                        margin-bottom: 10px;
                        margin-top: 20px;
                        font-size: 36px;
                    }

                    p {
                        margin: 0 0 10px;
                    }

                    *,
                    :after,
                    :before {
                        box-sizing: border-box;
                    }

                    .article {
                        padding: 2rem 0;
                    }

                    .article > h1 {
                        font-size: 2rem;
                    }

                    @media (min-width: 768px) {
                        .article > h1 {
                            font-size: 36px;
                        }
                    }

                    /* css end */
            `}
            </style>
            </Head>
            <main style={{
                padding: '2rem',
                textAlign: 'center',
                fontFamily: 'sans-serif',
            }}>
                <div>
                    <div className="article text-center">
                        <h1>404 Not Found</h1>
                        <p>お探しのページは存在しません。</p>
                    </div>
                </div>
            </main>
        </>
    );
}