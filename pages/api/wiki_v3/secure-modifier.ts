import type { NextApiRequest, NextApiResponse } from 'next'
import { App } from 'octokit'
import { encrypt } from '@/utils/wiki_crypto'

interface FileOperation {
    action: 'create' | 'update' | 'delete';
    path: string;
    content?: string; // create, update の場合は必須
    commitMessage: string;
}

interface RequestBodyProps {
    operations: FileOperation[];
    prTitle: string;
    prBody: string;
}

// 📌 直接コミット（Write）を許可する特定のディレクトリ
const DIRECT_WRITE_DIR = 'wiki/';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // POSTメソッドのみを許可
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    const repo = "AsakuraWikiMetadatas";
    const { operations, prTitle, prBody } = req.body as RequestBodyProps;

    // バリデーション
    if (!operations || !Array.isArray(operations) || operations.length === 0) {
        return res.status(400).json({ error: 'Missing required parameters' })
    }

    const owner = 'sakitibi'
    const baseBranch = 'main'

    const isPrRequired = operations.some(op => !op.path.startsWith(DIRECT_WRITE_DIR));

    try {
        // GitHub Appの初期化
        const app = new App({
            appId: process.env.GITHUB_APP_ID!,
            privateKey: process.env.ASKRPULL_SECRET_KEY!.replace(/\\n/g, '\n'),
        })
        const octokit = await app.getInstallationOctokit(parseInt(process.env.GITHUB_INSTALLATION_ID!, 10))

        let prBranch = baseBranch;
        let autoId: number | null = null;

        if (isPrRequired) {
            // 採番用の使い捨てチケット（Issue）を発行
            const { data: issueData } = await octokit.request('POST /repos/{owner}/{repo}/issues', {
                owner,
                repo,
                title: `🔑 自動採番チケット`,
                body: 'このIssueは、重複のない連番ブランチ（pull_waiting_${id}）を生成するためにWikiが自動作成しました。',
            })
            
            autoId = issueData.number;
            prBranch = `pull_waiting_${autoId}`;

            // 発行完了後、不要なIssueは即座にクローズ
            await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
                owner,
                repo,
                issue_number: autoId,
                state: 'closed',
                state_reason: 'completed'
            })

            // mainブランチの最新SHAをベースに、新しい連番ブランチを作成する
            const { data: mainRef } = await octokit.request('GET /repos/{owner}/{repo}/git/ref/heads/{ref}', {
                owner,
                repo,
                ref: baseBranch,
            })
            
            await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
                owner,
                repo,
                ref: `refs/heads/${prBranch}`,
                sha: mainRef.object.sha,
            })
        }

        for (const op of operations) {
            let currentFileSha: string | undefined = undefined

            // 更新・削除の場合は、操作先ブランチ（main または pull_waiting_X）から既存ファイルの sha を取得
            if (op.action === 'update' || op.action === 'delete') {
                try {
                    const { data: fileData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                        owner,
                        repo,
                        path: op.path,
                        ref: prBranch,
                    });
                    if (!Array.isArray(fileData) && fileData.type === 'file') {
                        currentFileSha = fileData.sha
                    }
                } catch (err: any) {
                    if (err.status !== 404) throw err;
                }
            }

            // ファイル作成・更新
            if (op.action === 'create' || op.action === 'update') {
                const encryptedContent = encrypt(op.content || '');

                await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                    owner,
                    repo,
                    path: op.path,
                    message: op.commitMessage,
                    content: Buffer.from(encryptedContent).toString('base64'),
                    branch: prBranch,
                    sha: currentFileSha,
                })
            } 
            // ファイル削除
            else if (op.action === 'delete') {
                if (!currentFileSha) continue; // 削除対象ファイルがなければスキップ
                await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
                    owner,
                    repo,
                    path: op.path,
                    message: op.commitMessage,
                    sha: currentFileSha,
                    branch: prBranch,
                })
            }
        }

        // 🚀 4. PRモードの場合は、最後にプルリクエストを作成
        if (isPrRequired && autoId) {
        const { data: prData } = await octokit.request('POST /repos/{owner}/{repo}/pulls', {
            owner,
            repo,
            title: prTitle || `🤖【要レビュー】自動ファイル変更 (連番ID: ${autoId})`,
            body: prBody || `Issue #${autoId} に基づく自動生成PRです。全ファイルは暗号化されてコミットされています。`,
            head: prBranch,
            base: baseBranch,
        })

        return res.status(200).json({ 
            success: true, 
            mode: 'PR', 
            id: autoId,
            branch: prBranch,
            url: prData.html_url,
            message: '指定ディレクトリ外の変更を検知したため、連番ブランチを作成してPRを出しました。'
        })
        }

        // 直接コミット完了のレスポンス
        return res.status(200).json({ 
        success: true, 
        mode: 'DIRECT', 
        message: `すべての変更が ${DIRECT_WRITE_DIR} 内だったため、mainブランチに直接暗号化コミットしました。` 
        })

    } catch (error: any) {
        console.error('API Process Error:', error)
        return res.status(500).json({ error: 'Internal Server Error', message: error.message })
    }
}