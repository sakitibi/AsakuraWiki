import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class AsakuraWikiDocument extends Document<{ nonce: string }> {
    static async getInitialProps(ctx: any) {
        const initialProps = await Document.getInitialProps(ctx)
        const nonce = ctx.req?.headers['x-nonce']
        return { ...initialProps, nonce }
    }

    render() {
        const nonce = this.props.nonce
        return (
            <Html>
                <Head nonce={nonce} />
                <body>
                    <Main />
                    <NextScript nonce={nonce} />
                </body>
            </Html>
        )
    }
}
