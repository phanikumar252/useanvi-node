/*

GEREKLİ PAKETLER YÜKLENİYOR...

*/
import * as DropboxSign from "@dropbox/sign";
import { createRequire } from "module";
import path from 'path';

// const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();
const require = createRequire(import.meta.url);
var http = require('http');
var express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');


const templateApi = new DropboxSign.TemplateApi();

// Configure HTTP basic authorization: api_key
templateApi.username = "974a9b82409dbc3d455d206027a0ccdced4b61edd04c51260f625679cdc2ea89";
var app = express();

// const role1 = {
// 	name: "Client",
// 	order: 0,
// };

const role2 = {
    name: "Witness",
    order: 1,
};

const mergeField1 = {
    name: "Full Name",
    type: "text",
};

const mergeField2 = {
    name: "Is Registered?",
    type: "checkbox",
};

const fieldOptions = {
    dateFormat: "DD - MM - YYYY",
};

// const data = {
// 	clientId: "e488e3aefd86b97aa20918998350a2f6",
// 	files: [fs.createReadStream("payroll.pdf")],
// 	title: "Test Template 4",
// 	subject: "Please sign this document",
// 	message: "For your approval",
// 	signerRoles: [

// 		role2,
// 	],
// 	ccRoles: ["Manager"],
// 	customFields: [
// 		{
// 			name: "FirstName",
// 			value: ""
// 		}
// 	],
// 	mergeFields: [
// 		mergeField1,
// 		mergeField2,
// 	],
// 	fieldOptions,
// 	testMode: true,
// };

const form = new FormData();
// form.append('Title', ' API template');
// form.append('Description', ' API template description');
// form.append('DocumentTitle', ' API document title');
// form.append('DocumentMessage', ' API document message description');
// form.append('Roles[0][name]', ' Manager');
// form.append('Roles[0][index]', ' 1');
// form.append('Roles[0][language]', ' English');
// form.append('ShowToolbar', ' false');
// form.append('ShowSaveButton', ' true');
// form.append('ShowSendButton', ' true');
// form.append('ShowPreviewButton', ' true');
// form.append('ShowNavigationButtons', ' false');
// form.append('ShowTooltip', 'false');
// form.append('ViewOption', ' PreparePage');
// form.append('Files', fs.createReadStream("payroll.pdf"));

const createDropBoxTemp = () => {
    const result = templateApi.templateCreateEmbeddedDraft(data);
    result.then(response => {
        console.log(response.body, "succc");
    }).catch(error => {
        console.log("Exception when calling Dropbox Sign API:");
        console.log(error.body, "error");
    });
}
// createDropBoxTemp()



const signatureRequestApi = new DropboxSign.SignatureRequestApi();

// Configure HTTP basic authorization: api_key
signatureRequestApi.username = "974a9b82409dbc3d455d206027a0ccdced4b61edd04c51260f625679cdc2ea89";

// or, configure Bearer (JWT) authorization: oauth2
// signatureRequestApi.accessToken = "YOUR_ACCESS_TOKEN";

const signer1 = {
    role: "Witness",
    emailAddress: "phanik@ovahq.com",
    name: "phani",
};

const signingOptions = {
    draw: true,
    type: true,
    upload: true,
    phone: false,
    defaultType: "draw",
};

const data = {
    clientId: "e488e3aefd86b97aa20918998350a2f6",
    templateIds: ["35cd2273f400cf90674c8b9a0a2eb504ed4cde92"],
    subject: "Purchase Order",
    message: "Glad we could come to an agreement.",
    signers: [signer1],
    signingOptions,
    testMode: true,
};

const sendTemplateEmbedded = () => {
    const result = signatureRequestApi.signatureRequestCreateEmbeddedWithTemplate(data);
    result.then(response => {
        console.log(response.body, 'success');
    }).catch(error => {
        console.log("Exception when calling Dropbox Sign API:");
        console.log(error.body, "error");
    });
}



sendTemplateEmbedded();



























const createField = () => {
    let data = JSON.stringify({
        "fieldName": "Primary Name five",
        "fieldDescription": "",
        "fieldOrder": 1,
        "brandId": "882fcdab-2904-410d-b56e-865ed0c97e9b",
        "sharedField": true,
        "name": "primary123",
        "formField": {
            "fieldType": "Textbox",
            "font": "Courier",
            "width": 60,
            "name": "primary123",
            "groupName": "primary123",
            "id": "primary123",
            "height": 20,
            "isRequired": false,
            "isReadOnly": false,
            "value": "Anil k",
            "fontSize": 13,

            "isBoldFont": true,
            "isItalicFont": true,
            "isUnderLineFont": true,
            "lineHeight": 15,
            "characterLimit": 0,
            "placeHolder": "Contact person three",

            "textDirection": "LTR",
            "characterSpacing": 0,

        }
    });
    try {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.boldsign.com/v1/customField/create',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json;odata.metadata=minimal;odata.streaming=true',
                'x-api-key': 'NTkyNzdkOWYtM2EwOS00MzI4LTgxY2UtNjkzYzdjZmJkZTU2'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                console.log(response.data, "success");
            })
            .catch((error) => {
                console.log(JSON.stringify(error), "error 2");
            });
    }
    catch (e) {
        console.log(e, "error field")
    }
}
// createField()

const createTemplate = async () => {
    const response = await axios.post(

        ' https://api.boldsign.com/v1/template/createEmbeddedTemplateUrl',

        form,
        {
            headers: {
                ...form.getHeaders(),
                'X-API-KEY': 'ZDY2ZmUwZWQtOGNlYy00MTgxLWEwMTAtNzU2M2RjYWY2OTdj'
            }
        }
    );
    console.log(response, 'fff')
}
// createTemplate()
const sendDoc = async () => {
    try {
        const response = await axios.post(
            'https://api.boldsign.com/v1/template/send',
            {
                roles: [
                    {
                        'roleIndex': 1,
                        'signerName': 'Anil',
                        'signerEmail': 'phanik@ovahq.com',
                        'existingFormFields': [
                            {
                                'id': "contractor_name",
                                'value': "Anil"
                            },


                            {
                                'id': "acc_one_routing",
                                'value': "123456789"
                            },
                            {
                                'id': "acc_one_account",
                                'value': "987456123"
                            },
                            {
                                'id': "signer_name",
                                'value': "Anil"
                            },


                        ]
                    }
                ],
                DisableEmails: true,


            },
            {
                params: {
                    'templateId': '51f8c75a-f558-42ea-be6a-98de17824ed3',
                },
                headers: {
                    'accept': 'application/json',
                    'X-API-KEY': 'NTkyNzdkOWYtM2EwOS00MzI4LTgxY2UtNjkzYzdjZmJkZTU2',
                    'Content-Type': 'application/json;odata.metadata=minimal;odata.streaming=true'
                }
            }
        );

        console.log(response, 'dd')
    }
    catch (e) {
        console.log(e, 'error')
    }

}
// sendDoc()

const generateLink = async () => {
    try {
        const response = await axios.get('https://api.boldsign.com/v1/document/getEmbeddedSignLink?documentId=97e22b01-cde5-40a9-91f8-ce72f78e8dd9&signerEmail=phanik@ovahq.com&redirectUrl=http://52.34.40.39:8900/CandidateEsign/thankspage&signLinkValidTill=11/22/2023', {
            headers: {
                'X-API-KEY': 'NTkyNzdkOWYtM2EwOS00MzI4LTgxY2UtNjkzYzdjZmJkZTU2'
            }
        });

        console.log(response, 'res')
    }
    catch (e) {
        console.log(e, "error")
    }
}
// generateLink()
app.set('port', process.env.PORT || 3005); // GİRİŞ PORTU AYARLANDI
app.set('views', __dirname + '/app/server/views'); // VIEW KLASÖRÜ TANITILDI
app.set('view engine', 'ejs'); // VIEW ENGINE AYARLANDI
app.use(express.static(__dirname + '/app/public')); // KULLANICILAR TARAFINDAN ERİŞİLEBİLEN KLASÖR TANIMLANDI

require('./app/routes.cjs')(app); // ROUTE DOSYASI ÇAĞIRILDI

/*

HTTP SERVER OLUŞTURULDU

*/
http.createServer(app).listen(app.get('port'), function () {
    console.log('Sistem ' + app.get('port') + ' Portu Üzerinde Çalışıyor.');
});
