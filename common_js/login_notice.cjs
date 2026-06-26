const url = "https://outlook.live.com/owa/0/service.svc?action=CreateItem&app=Mail&n=40";

const userToken = process.env.USER_TOKEN || "";
const toEmail = process.env.TO_EMAIL;
const userAgent = process.env.USER_AGENT || "";
const ipaddress = process.env.IPADDRESS;
const username = process.env.USERNAME || "ゲスト";

if (!userToken || !toEmail || !ipaddress) {
    console.error("Error: USER_TOKEN or TO_EMAIL or IPADDRESS environment variable is missing.");
    process.exit(1);
}

function escapeHtml (s) {
    return String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&`#39`;' }[c])
    )
};

const headers = {
    action: "CreateItem",
    "content-type": "application/json; charset=utf-8",
    "sec-fetch-dest": "empty",
    "accept-language": "ja",
    "sec-fetch-mode": "cors",
    "x-edge-shopping-flag": "0",
    cookie: "DefaultAnchorMailbox=PUID:00037FFF94124464@84df9e7f-e9f6-40af-b435-aaaaaaaaaaaa",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0",
    priority: "u=1, i",
    tracestate: "m365=scenario:owa",
    accept: "*/*",
    origin: "https://outlook.live.com",
    "sec-fetch-site": "same-origin",
    authorization: `MSAuth1.0 usertoken="${userToken}", type="MSACT"`,
    "x-anchormailbox": "PUID:00037FFF94124464@84df9e7f-e9f6-40af-b435-aaaaaaaaaaaa",
    "x-client-version": "20260612016.28",
    "x-owa-sessionid": "7ea8378d-95f7-48e6-83ba-27c707016a82",
    "accept-encoding": "gzip, deflate, br, zstd",
    "ms-cv": "UvJElQm17oXwKZ9FdETcik.47",
    "x-owa-correlationid": "a9289365-f8ee-9a26-1ea9-0282bb5ef5d2",
    prefer: "IdType=\"ImmutableId\", exchange.behavior=\"IncludeThirdPartyOnlineMeetingProviders\"",
    "x-owa-actionsource": "CreateItem",
    "x-req-source": "Mail",
    "x-owa-hosted-ux": "false",
};

const bodyData = {
    "__type": "CreateItemJsonRequest:#Exchange",
    "Header": {
        "__type": "JsonRequestHeaders:#Exchange",
        "RequestServerVersion": "V2018_01_08",
        "TimeZoneContext": {
            "__type": "TimeZoneContext:#Exchange",
            "TimeZoneDefinition": {
                "__type": "TimeZoneDefinitionType:#Exchange",
                "Id": "Tokyo Standard Time"
            }
        }
    },
    "Body": {
        "__type": "CreateItemRequest:#Exchange",
        "ClientSupportsIrm": true,
        "ComposeOperation": "newMail",
        "MessageDisposition": "SendAndSaveCopy",
        "Items": [
            {
                "__type": "Message:#Exchange",
                "BccRecipients": [],
                "Body": {
                    "BodyType": "HTML",
                    "DataUriCount": 0,
                    "Value": `
                    <!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>13ninアカウント -- 新しいデバイスからのログイン通知</title>
    <style>
        @font-face {
            font-family: 'shingo_pr6n';
            src: url('https://sakitibi.github.io/static.asakurawiki.com/fonts/shingo/shingo_pr6n.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        body {
            font-family: 'shingo_pr6n', 'Helvetica Neue', Arial, sans-serif;
            background-color: #f4f5f7;
            margin: 0;
            padding: 0;
            color: #333333;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .header {
            background-color: #1a73e8;
            color: #ffffff;
            padding: 25px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
        }
        .content {
            padding: 30px;
            line-height: 1.6;
        }
        .user-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: #f8f9fa;
            border-radius: 6px;
        }
        .info-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eeeeee;
            font-size: 14px;
        }
        .info-table td.label {
            font-weight: bold;
            color: #666666;
            width: 30%;
        }
        .warning-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            color: #856404;
            padding: 15px;
            margin-top: 25px;
            border-radius: 4px;
            font-size: 14px;
        }
        .btn-wrapper {
            text-align: center;
            margin: 25px 0;
        }
        .btn {
            background-color: #d93025;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-weight: bold;
            display: inline-block;
            font-size: 14px;
        }
        .footer {
            background-color: #f4f5f7;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #777777;
            border-top: 1px solid #eeeeee;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        新しいログイン通知
    </div>

    <div class="content">
        <div class="user-name">${escapeHtml(username)} 様</div>
        <p>13ninアカウントへの新しいログインが検出されました。これがご自身による操作である場合は、特別な対応は必要ありません。</p>

        <table class="info-table">
            <tr>
                <td class="label">日時(UTC)</td>
                <td>${new Date()}</td>
            </tr>
            <tr>
                <td class="label">デバイス</td>
                <td>${escapeHtml(userAgent)}</td>
            </tr>
            <tr>
                <td class="label">IPアドレス</td>
                <td>${escapeHtml(ipaddress)}</td>
            </tr>
        </table>

        <div class="warning-box">
            <strong>お心当たりがない場合</strong><br>
            もしこのログインに覚えがない場合は、第三者によってパスワードが破られた可能性があります。速やかにお問い合わせし、アカウントの安全を確保してください。
        </div>
    </div>

    <div class="footer">
        本メールは自動配信されています。返信はできませんのでご了承ください。<br>
        CopyRight 2025 13ninstudio, Inc. All Rights Reserved.
    </div>
</div>

</body>
</html>
                    `
                },
                "CcRecipients": [],
                "Importance": "Normal",
                "IsDeliveryReceiptRequested": false,
                "IsReadReceiptRequested": false,
                "IsSendIndividually": false,
                "ReferenceItemDocumentId": 0,
                "ReplyTo": [],
                "Sensitivity": "Normal",
                "Subject": "あさクラWiki ログイン通知",
                "ToRecipients": [
                    {
                        "EmailAddress": toEmail,
                        "Name": toEmail,
                        "MailboxType": "ExternalMailbox",
                        "RoutingType": "SMTP"
                    }
                ],
                "appendOnSend": [],
                "atMentionedRecipients": [],
                "clpLabelProperty": "",
                "disallowReactions": false,
                "draftComposeType": "newMail",
                "drawingCanvasElements": [],
                "internetHeaders": [],
                "internetHeadersToRemove": [],
                "mailboxInfo": {
                    "sourceId": "DEFDEFDE-FDEF-DEFD-EFDE-FDEFDEFDEFDE-00037FFF94124464@84df9e7f-e9f6-40af-b435-aaaaaaaaaaaa",
                    "type": "UserMailbox",
                    "mailboxSmtpAddress": "no-replys13ninstudio@outlook.jp",
                    "userIdentity": "no-replys13ninstudio@outlook.jp",
                    "mailboxRank": "Coprincipal",
                    "diagnosticData": "ASLSAccountMailbox",
                    "mailboxProvider": "Outlook"
                },
                "operation": "New",
                "prependOnSend": [],
                "recipientsAddedViaAtMention": [],
                "sendAs": {
                    "MailboxType": "Mailbox",
                    "RoutingType": "SMTP",
                    "EmailAddress": "no-replys13ninstudio@outlook.jp",
                    "Name": "13nin studio"
                },
                "From": {
                    "Mailbox": {
                        "MailboxType": "Mailbox",
                        "RoutingType": "SMTP",
                        "EmailAddress": "no-replys13ninstudio@outlook.jp",
                        "Name": "13nin studio"
                    }
                },
                "MessageDisposition": "SendAndSaveCopy",
                "MentionsEx": [],
                "ShouldIgnoreChangeKey": true,
                "ExtendedProperty": [
                    {
                        "__type": "ExtendedPropertyType:#Exchange",
                        "ExtendedFieldURI": {
                            "__type": "ExtendedPropertyUri:#Exchange",
                            "PropertyName": "msip_labels",
                            "DistinguishedPropertySetId": "InternetHeaders",
                            "PropertyType": "String"
                        },
                        "Value": ""
                    },
                    {
                        "__type": "ExtendedPropertyType:#Exchange",
                        "ExtendedFieldURI": {
                            "__type": "ExtendedPropertyUri:#Exchange",
                            "PropertySetId": "DD4705C0-74CF-455B-9886-894DA30B31B1",
                            "PropertyName": "InformationProtectionLabelId",
                            "PropertyType": "String"
                        },
                        "Value": ""
                    }
                ]
            }
        ],
        "TimeFormat": "H:mm",
        "SendOnNotFoundError": true,
        "RemoteExecute": false,
        "ItemShape": {
            "__type": "ItemResponseShape:#Exchange",
            "BaseShape": "IdOnly",
            "AdditionalProperties": [
                {
                    "__type": "PropertyUri:#Exchange",
                    "FieldURI": "ItemLastModifiedTime"
                }
            ]
        },
        "OutboundCharset": "AutoDetect",
        "UseGB18030": false,
        "UseISO885915": false
    }
};

async function run() {
    console.log("メール送信を開始します。");
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(bodyData)
        });
        const text = await response.text();
        if (!response.ok) {
            process.exit(1);
        }
    } catch (error) {
        process.exit(1);
    }
}

run();