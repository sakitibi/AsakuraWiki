import NextDocument, { Html, Head, Main, NextScript } from 'next/document';

export default class Document extends NextDocument {
    render() {
        return (
        <Html>
            <Head>
                <meta name="apple-mobile-web-app-title" content="asakura-wiki" />
            </Head>
            <body>
            <Main />
            <NextScript />
            </body>
        </Html>
        );
    }
}