export default function PushFetchComponents2(
    message: string,
    path: string,
    new_path: string,
    bytes: Uint8Array<ArrayBuffer>
) {
    const formData = new FormData();
    const blob = new Blob([bytes]);
    // 各フィールドを追加
    formData.append("message", message);
    formData.append("placeholder_message", "Update codes");
    formData.append("description", "");
    formData.append("commit-choice", "direct");
    formData.append("target_branch", "main");
    formData.append("quick_pull", "");
    formData.append("guidance_task", "");
    formData.append("commit", "cb5d8846ab459f4cfa6dcd2a4d4a6d88d913b0f5");
    formData.append("same_repo", "1");
    formData.append("pr", "");
    formData.append("content_changed", "true");
    formData.append("filename", path);
    formData.append("new_filename", new_path);
    formData.append("value", blob);
    return formData;
}