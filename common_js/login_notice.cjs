const url = "https://outlook.live.com/owa/0/service.svc?action=CreateItem&app=Mail&n=40";

const userToken = process.env.USER_TOKEN || "";
const toEmail = process.env.TO_EMAIL;

if (!userToken || !toEmail) {
    console.error("Error: USER_TOKEN or TO_EMAIL environment variable is missing.");
    process.exit(1);
}

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
                    "Value": "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"><style type=\"text/css\" style=\"display:none;\"> P {margin-top:0;margin-bottom:0;} </style></head><body dir=\"ltr\"><div class=\"elementToProof\" style=\"font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 16pt; color: rgb(255, 0, 0);\">ログイン通知</div></body></html>"
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