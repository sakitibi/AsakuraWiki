import { NextApiRequest, NextApiResponse } from 'next';
import { jwtVerify, errors } from 'jose';

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];

interface CustomPayloadProps{
    id: string;
    email: string;
    exp: number;
}

async function verifyJwtWithSecret(token: string, secretString: string) {
    try {
        const secret = new TextEncoder().encode(secretString);

        const { payload } = await jwtVerify(token, secret, {
            algorithms: ['HS256'],
        });
        const CustomPayload = payload as unknown as CustomPayloadProps;

        console.log("検証成功！トークンは有効です。");
        return { success: true, CustomPayload };

    } catch (error) {
        // 3. エラーハンドリング
        if (error instanceof errors.JWTExpired) {
            console.error("エラー: 有効期限が切れています(exp切れ)。");
        } else if (error instanceof errors.JWTInvalid) {
            console.error("エラー: 署名が不正、またはトークンの形式が壊れています。");
        } else {
            console.error("エラー: 認証に失敗しました。", error);
        }
        return { success: false, error };
    }
}

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'null'); // 許可しない場合
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'POST') {
        const body = req.body;
        const notice_token = body.notice_token;
        if (!notice_token) {
            return res.status(401).json({success: false, error: "unauthorized"});
        }
        const Payload = await verifyJwtWithSecret(
            notice_token,
            process.env.JWT_SIGN_SECRET!
        );
        if (!Payload.success || !Payload.CustomPayload) {
            return res.status(401).json({success: false, error: "unauthorized"});
        }
        const response = await fetch("https://outlook.live.com/owa/0/service.svc?action=CreateItem&app=Mail&n=26", {
            method: "POST",
            headers: {
                authorization: `MSAuth1.0 usertoken=\"${process.env.MS_SESSION}\", type=\"MSACT\"`,
                accept: "*/*",
                "sec-fetch-mode": "cors",
                action: "CreateItem",
                tracestate: "m365=scenario:owa",
                "x-edge-shopping-flag": "0",
                "sec-fetch-dest": "empty",
                cookie: "SIMI=eyJzdCI6MH0=",
                "x-owa-sessionid": "b602d97d-ce96-4774-b6d8-89cbedca87b2",
                "content-type": "application/json; charset=utf-8",
                priority: "u=1, i",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0",
                "x-owa-hosted-ux": "false",
                "x-owa-correlationid": "c5d6becc-944c-2083-12bf-e304539467f7",
                "x-anchormailbox": "PUID:00037FFF94124464@84df9e7f-e9f6-40af-b435-aaaaaaaaaaaa",
                "x-client-version": "20260608008.14",
                "x-req-source": "Mail",
                "accept-encoding": "gzip, deflate, br, zstd",
                "ms-cv": "6YNmrC7ys/WVVqVp/+Yic8.26",
                prefer: "IdType=\"ImmutableId\", exchange.behavior=\"IncludeThirdPartyOnlineMeetingProviders\"",
                origin: "https://outlook.live.com",
                "sec-fetch-site": "same-origin",
                "content-length": "3040",
                "accept-language": "ja",
                "x-owa-actionsource": "CreateItem",
            },
            body: JSON.stringify({
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
                                "Value": "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"><style type=\"text/css\" style=\"display:none;\"> P {margin-top:0;margin-bottom:0;} </style></head><body dir=\"ltr\"><div class=\"elementToProof\" style=\"font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);\">ただいま試験中</div></body></html>"
                            },
                            "CcRecipients": [],
                            "Importance": "Normal",
                            "IsDeliveryReceiptRequested": false,
                            "IsReadReceiptRequested": false,
                            "IsSendIndividually": false,
                            "ReferenceItemDocumentId": 0,
                            "ReplyTo": [],
                            "Sensitivity": "Normal",
                            "Subject": "nest",
                            "ToRecipients": [
                                {
                                    "EmailAddress": Payload.CustomPayload.email,
                                    "Name": Payload.CustomPayload.email,
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
            }),
        });
        if (!response.ok) {
            return res.status(500).json({success: false, error: "Mail Send Failed."});
        }
        const data = await response.json();
        return res.status(200).json({success: true, data});
    } else if (req.method === "OPTIONS") {
        return res.status(200).end();
    } else {
        res.setHeader('Allow', ['POST','OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
