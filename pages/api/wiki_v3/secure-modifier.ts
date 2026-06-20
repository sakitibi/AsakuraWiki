import type { NextApiRequest, NextApiResponse } from 'next'
import { App } from 'octokit'
import { encrypt } from '@/utils/wiki_crypto'

interface FileOperation {
    action: 'create' | 'update' | 'delete';
    path: string;
    content?: string;
    commitMessage: string;
}

interface RequestBodyProps {
    operations: FileOperation[];
    prTitle: string;
    prBody: string;
}

const DIRECT_WRITE_DIR = 'wiki/';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    const repo = "AsakuraWikiMetadatas";
    const { operations, prTitle, prBody } = req.body as RequestBodyProps;

    if (!operations || !Array.isArray(operations) || operations.length === 0) {
        return res.status(400).json({ error: 'Missing required parameters' })
    }

    const owner = 'sakitibi'
    const baseBranch = 'main'

    const isPrRequired = operations.some(op => !op.path.startsWith(DIRECT_WRITE_DIR));

    try {
        const app = new App({
            appId: process.env.GITHUB_APP_ID!,
            privateKey: process.env.ASKRPULL_SECRET_KEY!.replace(/\\n/g, '\n'),
        })
        const octokit = await app.getInstallationOctokit(parseInt(process.env.GITHUB_INSTALLATION_ID!, 10))

        let prBranch = baseBranch;
        let autoId: number | null = null;

        if (isPrRequired) {
            const { data: issueData } = await octokit.request('POST /repos/{owner}/{repo}/issues', {
                owner,
                repo,
                title: `🔑 自動採番チケット`,
                body: 'このIssueは、重複のない連番ブランチ（pull_waiting_${id}）を生成するためにWikiが自動作成しました。',
            })
            
            autoId = issueData.number;
            prBranch = `pull_waiting_${autoId}`;

            await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
                owner,
                repo,
                issue_number: autoId,
                state: 'closed',
                state_reason: 'completed'
            })

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

        for (let i = 0;i < operations.length;i++) {
            let currentFileSha: string | undefined = undefined

            try {
                const { data: fileData } = await octokit.request(`GET /repos/${owner}/${repo}/contents/${operations[i].path}`, {
                    ref: prBranch,
                });
                if (!Array.isArray(fileData) && fileData.type === 'file') {
                    currentFileSha = fileData.sha
                }
            } catch (err: any) {
                if (err.status !== 404) throw err;
            }

            // ファイル作成・更新
            if (operations[i].action === 'create' || operations[i].action === 'update') {
                const encryptedContent = encrypt(operations[i].content || '');

                await octokit.request(`PUT /repos/${owner}/${repo}/contents/${operations[i].path}`, {
                    message: operations[i].commitMessage,
                    content: Buffer.from(encryptedContent).toString('base64'),
                    branch: prBranch,
                    sha: currentFileSha, // 新規作成時は undefined、上書き時は既存のSHAが入る
                })
            } 
            // ファイル削除
            else if (operations[i].action === 'delete') {
                if (!currentFileSha) continue;

                await octokit.request(`DELETE /repos/${owner}/${repo}/contents/${operations[i].path}`, {
                    message: operations[i].commitMessage,
                    sha: currentFileSha,
                    branch: prBranch,
                })
            }
        }

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

        return res.status(200).json({ 
            success: true, 
            mode: 'DIRECT', 
            message: `すべての変更が ${DIRECT_WRITE_DIR} 内だったため、mainブランチに直接暗号化コミットしました。` 
        })

    } catch (error: any) {
        console.error('API Process Error:', error)
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            message: error.message,
            githubError: error.response?.data
        })
    }
}