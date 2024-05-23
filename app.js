

import fs from 'fs'
import Anvil from '@anvilco/anvil'
import { createRequire } from "module";
import path from 'path';
const __dirname = path.resolve();
const require = createRequire(import.meta.url);
var http = require('http');
var express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const { request } = require('graphql-request');
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config();
const AWS = require('aws-sdk');
var quicksightClient = new AWS.Service({
    apiConfig: require('aws-sdk/apis/quicksight-2018-04-01.min.json'),
    region: 'us-west-2',
});
console.log(process.env.AWS_ACCESS_KEY_ID, 'process.env.AWS_ACCESS_KEY_ID')
const SESConfig = {
    apiVersion: "2018-04-01",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1"
}
AWS.config.update(SESConfig);
const app = express();
app.use(express.json({ limit: "50mb", type: "application/json" }))
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: 'application/json' }))

app.use(cors({
    origin: "*"
}));

// The ID of the PDF template to fill
const pdfTemplateID = '2Oac1eKLbkYtj8NASclu'
// Your API key from your Anvil organization settings
const apiKey = '3omv8BJAYGmo8xscUj59vu9zpvcsl4Tu'
const anvilClient = new Anvil({ apiKey })

const encodedToken = Buffer.from('3omv8BJAYGmo8xscUj59vu9zpvcsl4Tu:', 'ascii').toString('base64')
const basicAuth = `Basic ${encodedToken}`

const endpoint = `https://graphql.useanvil.com'`


// console.log(anvilClient, 'anvilClient')
const prefillData = async () => {

    const exampleData = {
        "title": "My PDF Title",
        "fontSize": 10,
        "textColor": "#CC0000",
        "data": {
            "accountNumber0": "123456789",
        }
    }


    // const { statusCode, data } = await anvilClient.fillPDF(pdfTemplateID, exampleData)

    const options = { versionNumber: Anvil.VERSION_LATEST }
    const { statusCode, data } = await anvilClient.fillPDF(pdfTemplateID, exampleData, options)

    console.log(statusCode) // => 200

    // Data will be the filled PDF raw bytes
    fs.writeFileSync('output.pdf', data, { encoding: null })
}


const templateW4 = {
    id: 'payroll1',
    // castEid is also known as the 'PDF template ID'
    // found under the 'API Info' tab on the PDF template page
    //  2Oac1eKLbkYtj8NASclu
    castEid: undefined,
}

const packetFiles = [templateW4]

const signaturePacketVariables = {
    isDraft: false,
    isTest: true,
    files: packetFiles,
    signers: [
        {
            id: "signer1",
            // Important! This tells Anvil that our app will be
            // notifying the signer when it is their turn to sign
            signerType: 'embedded',
            // Important! This tells Anvil to redirect to this URL
            // after the signer has completed their signatures
            // redirectURL: 'http://localhost:3000/CandidateEsign/thankspage',
            tokenValidForMinutes: 60 * 24 * 3,
            // fields left undefined to be filled using webform input
            name: undefined,
            email: undefined,
            fields: [
                // {
                // 	fileId: 'payroll1',
                // 	fieldId: 'signatureOne',
                // },
            ],
        },
        {
            id: "clientSignature",
            // Important! This tells Anvil that our app will be
            // notifying the signer when it is their turn to sign
            signerType: 'embedded',
            // Important! This tells Anvil to redirect to this URL
            // after the signer has completed their signatures
            // redirectURL: 'http://localhost:3000/CandidateEsign/thankspage',
            tokenValidForMinutes: 60 * 24 * 3,
            // fields left undefined to be filled using webform input
            name: "Anil",
            email: "akunde@ovahq.com",
            fields: [
                // {
                // 	fileId: 'payroll1',
                // 	fieldId: 'signatureOne',
                // },
            ],
        },
    ],
    data: {
        payloads: {
            payroll1: {
                data: {},
            },
        },
    },
}

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});

app.get("/getTemplates", (request, response) => {
    var data = JSON.stringify({
        query: `query OrganizationQuery($organizationSlug: String!) {
			data: organization(organizationSlug: $organizationSlug) {
			  id
			  eid
			  slug
			  name
			  config
			  currentUserRole
			  createdAt
			  updatedAt
			  subscriptionActivity
			  hasUsedGeneratePDF
			  subscribedPlanFeatures
		
			  casts(isTemplate: true) {
				id
				eid
				name
				title
				updatedAt
				__typename
				
			  }
			  __typename
			}
		  }`,
        variables: { organizationSlug: "curately-ai" }
    });

    // var username = 'TbyeNvYb8Y9aS2P6T8PyIqslc5wSLS1Q';



    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://graphql.useanvil.com',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': basicAuth
        },
        data: data
    };

    axios(config)
        .then(function (res) {
            response.send(res.data)
            // console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });
});


app.post("/getTemplateFields", (req, res) => {
    const { eid } = req.body
    // console.log(req, 'reeee')
    let variables = { eid, versionNumber: -3 }
    anvilClient.requestGraphQL({
        query: `query CastQuery($eid: String!, $versionNumber: Int, $relatedOrganizationsActions: [String]) {
			data: cast(eid: $eid, versionNumber: $versionNumber) {
			  ...castFieldsFragment
			  __typename
			}
		  }
		  
		  fragment castFieldsFragment on Cast {
			id
			eid
			type
			name
			title
			config
			location
			createdAt
			updatedAt
			versionNumber
			fieldInfo
			exampleData
			hasUnpublishedChanges
			publishedAt
			isLatestVersion
			isPublishedVersion
			hasBeenPublished
			organization {
			  id
			  eid
			  name
			  slug
			  currentUserRole
			  subscribedPlanFeatures
			  relatedOrganizations(actions: $relatedOrganizationsActions) {
				id
				eid
				name
				slug
				__typename
			  }
			  __typename
			}
			publishedVersions {
			  items {
				id
				publishedNumber
				publishedTitle
				publishedDescription
				publishedAt
				publishingUser {
				  id
				  name
				  __typename
				}
				__typename
			  }
			  __typename
			}
			__typename
		  }`,
        variables
    },
        { dataType: 'json' }).then((response) => {
            res.send(response)
        }).catch((error) => {
            console.log(error, 'error')
            res.send(error)
        })
})

app.post("/getTemplate", (req, res) => {
    const { eid } = req.body
    // console.log(req, 'reeee')
    let variables = { eid }
    anvilClient.requestGraphQL({
        query: `query ($eid: String!) {
            data: cast(eid: $eid) {
                id
                eid
                type
                name
                title
                config
                location
                createdAt
                updatedAt
                versionNumber
                organization {
                    id
                    eid
                    name
                    slug
                    subscribedPlanFeatures
                }
            }
        }
        `,
        variables
    },
        { dataType: 'json' }).then((response) => {
            res.send(response)
        }).catch((error) => {
            console.log(error, 'error')
            res.send(error)
        })
})
// const path = require('path')
"C:\Users\Phani Kumar Ankem\Downloads\Compliance Forms (1).pdf"

const fileUploadPath = path.join(__dirname, '..', '..', 'Downloads', 'payroll.pdf')
// const ndaFile = Anvil.prepareGraphQLFile(fileUploadPath)
// console.log(fileUploadPath, 'ndaFile', ndaFile)

app.post('/createTemplate', (req, resp) => {

    let { title, file } = req.body;
    // file.filename = "payroll.pdf";
    var buf = Buffer.from(file.data, 'base64');
    let newFile = Anvil.prepareGraphQLFile(buf, {
        filename: file.filename,
        mimetype: "application/pdf"
    })

    let variables = {
        "organizationEid": "f2AzCk56ltQW3xPZB2Rt",
        "allowedAliasIds": ["date", "name", "email", "phone", 'socialSecurityNumber', "address", "city", "signer1", "signer2"],
        "file": newFile,
        "isTemplate": true,
        "detectFields": false
    }


    anvilClient.requestGraphQL({
        query: `mutation CreateCast(
			$organizationEid: String
            $allowedAliasIds: [String],
			$file: Upload!
			$isTemplate: Boolean
			$detectFields: Boolean
		  ) {
			createCast(
			  organizationEid: $organizationEid
              allowedAliasIds: $allowedAliasIds,
			  file: $file
			  isTemplate: $isTemplate
			  detectFields: $detectFields
			) {
			  id
			  eid
			  name
			  title
			  config
			  location
			  createdAt
			  updatedAt
			  isTemplate
			  organization {
				id
				eid
				slug
				name
			  }
			}
		  }`,
        variables
    },
        { dataType: 'json' }).then((response) => {
            resp.send(response)
        }).catch((error) => {
            console.log(error, 'error')
            resp.send(error)
        })



})

app.post('/editTemplateDefault', (req, resp) => {

    let { castId } = req.body
    let variables = {
        "type": "edit-pdf-template",
        "eid": castId,
        // "validUntil": "2024-06-12T01:43:50+00:00",
        "validForSeconds": 86400

    }
    let data = JSON.stringify({
        query: `mutation generateEmbedURL(
			$type: String!,
			$eid: String!,
			$validUntil: String,
			$validForSeconds: Int,
			$options: JSON,
			$metadata: JSON
		  ) {
			generateEmbedURL(
			  type: $type,
			  eid: $eid,
			  validUntil: $validUntil,
			  validForSeconds: $validForSeconds,
			  options: $options,
			  metadata: $metadata
			) {
			  requestTokenEid
			  url
			}
		  }
		  `,
        // variables: {
        //     "type": "edit-pdf-template",
        //     "eid": castId,
        //     // "validUntil": "2024-06-12T01:43:50+00:00",
        //     "validForSeconds": 86400,
        //     "options": {
        //         "mode": "preset-fields",
        //         "pageTitle": "Title of the page",
        //         "title": "Sidebar title",
        //         description: 'Please draw fields indicated below.',
        //         selectionDescription:
        //             'Select the field that best represents the box drawn.',
        //         showPageTitleBar: false,
        //         // finishButtonText: 'Custom text',
        //         // selectionAddAnotherFieldText: 'Plz add another field',
        //         fields: [
        //             // * `aliasId` can be anything you'd like: https://www.useanvil.com/docs/api/fill-pdf/#field-ids
        //             // * All types: https://www.useanvil.com/docs/api/fill-pdf/#all-field-types
        //             {
        //                 name: 'Full name',
        //                 type: 'fullName',
        //                 aliasId: 'name',
        //                 required: false,

        //                 // optional fields
        //                 alignment: 'center', // `left`, `center`, `right`
        //                 fontSize: '12',
        //                 fontWeight: 'boldItalic', // 'normal', `bold`, `boldItalic`, `italic`
        //                 fontFamily: 'Futura', // Any google font, 'Helvetica', 'Times new roman', 'Courier'
        //                 textColor: '#a00000',
        //             },
        //             {
        //                 name: 'Email',
        //                 type: 'email',
        //                 aliasId: 'email',
        //                 required: false,
        //             },
        //             {
        //                 name: 'Date of birth',
        //                 type: 'date',
        //                 aliasId: 'dob',
        //                 required: false,

        //                 // optional date fields:
        //                 format: 'MMMM Do YYYY', // see moment.js docs
        //             },
        //             {
        //                 name: 'Client signature',
        //                 type: 'signature',
        //                 aliasId: 'clientSignature',
        //                 required: false,
        //             },
        //             {
        //                 name: 'Sales signature',
        //                 type: 'signature',
        //                 aliasId: 'salesSignature',
        //                 required: false,
        //             },
        //             {
        //                 name: 'Client initials',
        //                 type: 'initial',
        //                 aliasId: 'clientInitials',
        //                 required: false,
        //             },
        //             {
        //                 name: 'Client signature date',
        //                 type: 'signatureDate',
        //                 aliasId: 'clientSignatureDate',
        //                 required: false,
        //             },
        //             {
        //                 name: 'Job Title',
        //                 type: 'shortText',
        //                 aliasId: 'job_title',
        //                 required: false,
        //             },
        //         ],
        //     },
        //     // "metadata": {"internalUserId": 123}
        // }
        variables: {
            "type": "edit-pdf-template",
            "eid": castId,
            // "validUntil": "2024-06-12T01:43:50+00:00",
            "validForSeconds": 86400,

            // "metadata": {"internalUserId": 123}
        }
    });

    anvilClient.requestGraphQL({
        query: `mutation generateEmbedURL(
			$type: String!,
			$eid: String!,
			$validUntil: String,
			$validForSeconds: Int,
			$options: JSON,
			$metadata: JSON
		  ) {
			generateEmbedURL(
			  type: $type,
			  eid: $eid,
			  validUntil: $validUntil,
			  validForSeconds: $validForSeconds,
			  options: $options,
			  metadata: $metadata
			) {
			  requestTokenEid
			  url
			}
		  }`,
        variables
    },
        { dataType: 'json' }).then((response) => {
            resp.send(response)
        }).catch((error) => {
            console.log(error, 'error')
            resp.send(error)
        })

})

app.post('/deleteTemplate', (req, res) => {
    let { templateId } = req.body
    let data = JSON.stringify({
        query: `mutation UpdateCast(
            $eid: String!
            $name: String
            $title: String
            $config: JSON
            $configFile: Upload
            $file: Upload
            $isArchived: Boolean
            $versionNumber: Int
          ) {
            updateCast(
              eid: $eid
              name: $name
              title: $title
              config: $config
              configFile: $configFile
              file: $file
              isArchived: $isArchived
              versionNumber: $versionNumber
            ) {
              id
              eid
              name
              title
              config
              location
              updatedAt
              archivedAt
              fieldInfo
              exampleData
              versionNumber
            }
          }
		  `,
        variables: {
            eid: templateId,
            isArchived: true
        }

    });

    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://graphql.useanvil.com',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': basicAuth
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            // console.log(res, 'res')
            res.send(response.data)
            // console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {

            let { response } = error
            console.log(response.data);
            res.send(error)
        });
})
app.post('/editTemplate', (req, resp) => {

    let { castId, fieldData } = req.body
    let variables = {
        "type": "edit-pdf-template",
        "eid": castId,
        // "validUntil": "2024-06-12T01:43:50+00:00",
        "validForSeconds": 86400,

        options: {
            "mode": "preset-fields",
            "pageTitle": "",
            "title": "",
            description: 'Please draw fields indicated below.',
            selectionDescription:
                'Select the field that best represents the box drawn.',
            showPageTitleBar: false,
            // finishButtonText: 'Custom text',
            // selectionAddAnotherFieldText: 'Plz add another field',
            fields: fieldData
        }
    }
    let data = JSON.stringify({
        query: `mutation generateEmbedURL(
			$type: String!,
			$eid: String!,
			$validUntil: String,
			$validForSeconds: Int,
			$options: JSON,
			$metadata: JSON
		  ) {
			generateEmbedURL(
			  type: $type,
			  eid: $eid,
			  validUntil: $validUntil,
			  validForSeconds: $validForSeconds,
			  options: $options,
			  metadata: $metadata
			) {
			  requestTokenEid
			  url
			}
		  }
		  `,
        // variables: {
        //     "type": "edit-pdf-template",
        //     "eid": castId,
        //     // "validUntil": "2024-06-12T01:43:50+00:00",
        //     "validForSeconds": 86400,
        //     "options": {
        //         "mode": "preset-fields",
        //         "pageTitle": "Title of the page",
        //         "title": "Sidebar title",
        //         description: 'Please draw fields indicated below.',
        //         selectionDescription:
        //             'Select the field that best represents the box drawn.',
        //         showPageTitleBar: false,
        //         // finishButtonText: 'Custom text',
        //         // selectionAddAnotherFieldText: 'Plz add another field',
        //         fields: [
        //             // * `aliasId` can be anything you'd like: https://www.useanvil.com/docs/api/fill-pdf/#field-ids
        //             // * All types: https://www.useanvil.com/docs/api/fill-pdf/#all-field-types
        //             {
        //                 name: 'Full name',
        //                 type: 'fullName',
        //                 aliasId: 'name',
        //                 required: false,

        //                 // optional fields
        //                 alignment: 'center', // `left`, `center`, `right`
        //                 fontSize: '12',
        //                 fontWeight: 'boldItalic', // 'normal', `bold`, `boldItalic`, `italic`
        //                 fontFamily: 'Futura', // Any google font, 'Helvetica', 'Times new roman', 'Courier'
        //                 textColor: '#a00000',
        //             },
        //             {
        //                 name: 'Email',
        //                 type: 'email',
        //                 aliasId: 'email',
        //                 required: false,
        //             },
        //             {
        //                 name: 'Date of birth',
        //                 type: 'date',
        //                 aliasId: 'dob',
        //                 required: false,

        //                 // optional date fields:
        //                 format: 'MMMM Do YYYY', // see moment.js docs
        //             },
        //             {
        //                 name: 'Client signature',
        //                 type: 'signature',
        //                 aliasId: 'clientSignature',
        //                 required: false,
        //             },
        //             {
        //                 name: 'Sales signature',
        //                 type: 'signature',
        //                 aliasId: 'salesSignature',
        //                 required: false,
        //             },
        //             {
        //                 name: 'Client initials',
        //                 type: 'initial',
        //                 aliasId: 'clientInitials',
        //                 required: false,
        //             },
        //             {
        //                 name: 'Client signature date',
        //                 type: 'signatureDate',
        //                 aliasId: 'clientSignatureDate',
        //                 required: false,
        //             },
        //             {
        //                 name: 'Job Title',
        //                 type: 'shortText',
        //                 aliasId: 'job_title',
        //                 required: false,
        //             },
        //         ],
        //     },
        //     // "metadata": {"internalUserId": 123}
        // }
        variables: {
            "type": "edit-pdf-template",
            "eid": castId,
            // "validUntil": "2024-06-12T01:43:50+00:00",
            "validForSeconds": 86400,

            // "metadata": {"internalUserId": 123}
        }
    });

    anvilClient.requestGraphQL({
        query: `mutation generateEmbedURL(
			$type: String!,
			$eid: String!,
			$validUntil: String,
			$validForSeconds: Int,
			$options: JSON,
			$metadata: JSON
		  ) {
			generateEmbedURL(
			  type: $type,
			  eid: $eid,
			  validUntil: $validUntil,
			  validForSeconds: $validForSeconds,
			  options: $options,
			  metadata: $metadata
			) {
			  requestTokenEid
			  url
			}
		  }`,
        variables
    },
        { dataType: 'json' }).then((response) => {
            resp.send(response)
        }).catch((error) => {
            console.log(error, 'error')
            resp.send(error)
        })

})

app.post('/createEsign', async (req, res) => {

    try {
        const {
            name, email, templateId, fieldData, signerFields
        } = req.body

        signaturePacketVariables.signers[0].name = name
        signaturePacketVariables.signers[0].email = email
        signaturePacketVariables.files[0].castEid = templateId
        signaturePacketVariables.data.payloads.payroll1.data = fieldData;
        // let signFields = []
        // signerFields.forEach(element => {
        // 	signFields.push({
        // 		fileId: signaturePacketVariables.files[0].id,
        // 		fieldId: element
        // 	})
        // });
        signaturePacketVariables.signers[0].fields = [{ fileId: 'payroll1', fieldId: 'salesSignature' }]
        signaturePacketVariables.signers[1].fields = [{ fileId: 'payroll1', fieldId: 'clientSignature' }]

        // console.log(JSON.stringify(signaturePacketVariables))
        // console.log(signaturePacketVariables, 'signaturePacketVariables')
        const {
            statusCode, data, errors
        } = await anvilClient.createEtchPacket({ variables: signaturePacketVariables })
        // console.log("errors 1", errors)
        const signaturePacketEid = data.data.createEtchPacket.eid


        // Add the new post to the list of posts
        res.send({ packetId: signaturePacketEid });
    }

    catch (e) {
        res.send(e)
        console.log(e, "error")
    }


});

app.post('/createEtchPacket', async (req, resp) => {
    try {
        const { signaturePacketEid } = req.body
        // const { signaturePacketEid } = req.body
        const { data } = await anvilClient.getEtchPacket({
            variables: { eid: signaturePacketEid },
        })
        console.log(signaturePacketEid, 'signaturePacketEid')
        // We only have 1 signer for this signature packet
        console.log(data, "data here")
        // const signers = data.data.etchPacket.documentGroup.signers
        // const signerEid = signers[0].eid
        // console.log(signers, 'signers', signerEid)
        // console.log(data, "data here")
        const signers = data.data.etchPacket
        resp.send(signers)
    }
    catch (e) {
        resp.send(e)
    }
})

app.post('/createSignUrl', async (req, res) => {

    try {
        const { signerEid, clientUserId } = req.body
        // const { data } = await anvilClient.getEtchPacket({
        //     variables: { eid: signerEid },
        // })
        // console.log(signaturePacketEid, 'signaturePacketEid')
        // // We only have 1 signer for this signature packet
        // console.log(data, "data here")
        // const signers = data.data.etchPacket.documentGroup.signers
        // const signerEid = signers[0].eid
        // console.log(signers, 'signers', signerEid)
        // The signing URL generated here is used to
        // embed the signing page into our app
        const { url } = await anvilClient.generateEtchSignUrl({
            variables: { signerEid, clientUserId }
        })

        console.log(url, 'url')

        res.send({ url })
    }
    catch (e) {
        console.log(e, 'e')
        res.send(e)
    }
})

app.post("/sitesVerify", async (req, resp) => {
    let { token, secret } = req.body

    console.log(req, "req", req.body)
    let formData = new FormData()
    formData.append('secret', "0x4AAAAAAAR-XZXd7d7O5vMC8XO9zvRP_gI");
    formData.append('response', token);

    // console.log(JSON.stringify(formData), 'formData')
    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',

        data: formData
    };

    axios(config)
        .then(function (response) {
            console.log(response.data, 'respp')
            resp.send(response.data)
            // console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {

            // let { errors } = error
            // console.log(JSON.stringify(error));
            resp.send(error)
        });
    // const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    //     body: formData,
    //     method: 'POST',
    // });

    // const outcome = await result.json();
    // if (!outcome.success) {
    //     res.send(outcome)
    //     // new Response('The provided Turnstile token was not valid! \n' + JSON.stringify(outcome));
    // }
    // // The Turnstile token was successfuly validated. Proceed with your application logic.
    // // Validate login, redirect user, etc.
    // // For this demo, we just echo the "/siteverify" response:
    // res.send(outcome)
})

app.post("/updateWorkflow", (req, res) => {
    let { weldEid, configData } = req.body

    // console.log(JSON.stringify(signerFields, 'hh'))
    let data = JSON.stringify(
        {
            query: `mutation UpdateWeld(
                $eid: String!
                $slug: String
                $name: String
                $visibility: String
                $config: JSON
                $configFile: Upload
                $isArchived: Boolean
                $expiresAt: String
                $draftStep: String
                $entryForgeId: Int
                $entryButtonText: String
                $entryButtonCopyLink: Boolean
                $signatureEmailBody: JSON
                $signatureEmailSubject: JSON
                $dataDisplayTitle: JSON
                $signatureProvider: String
                $lockedTitleNew: String
                $lockedDescriptionNew: String
                $lockedTitleExisting: String
                $lockedDescriptionExisting: String
                $expireAfterDaysStart: Int
                $expireAfterDaysComplete: Int
                $planEid: String
                $versionNumber: Int
                $weldCompleteEmailRecipients: JSON
                $mergePDFs: Boolean
              ) {
                updateWeld(
                  eid: $eid
                  slug: $slug
                  name: $name
                  visibility: $visibility
                  config: $config
                  configFile: $configFile
                  isArchived: $isArchived
                  expiresAt: $expiresAt
                  draftStep: $draftStep
                  entryForgeId: $entryForgeId
                  entryButtonText: $entryButtonText
                  entryButtonCopyLink: $entryButtonCopyLink
                  signatureEmailBody: $signatureEmailBody
                  signatureEmailSubject: $signatureEmailSubject
                  dataDisplayTitle: $dataDisplayTitle
                  signatureProvider: $signatureProvider
                  lockedTitleNew: $lockedTitleNew
                  lockedDescriptionNew: $lockedDescriptionNew
                  lockedTitleExisting: $lockedTitleExisting
                  lockedDescriptionExisting: $lockedDescriptionExisting
                  expireAfterDaysStart: $expireAfterDaysStart
                  expireAfterDaysComplete: $expireAfterDaysComplete
                  planEid: $planEid
                  versionNumber: $versionNumber
                  weldCompleteEmailRecipients: $weldCompleteEmailRecipients
                  mergePDFs: $mergePDFs
                ) {
                  id
                  eid
                  slug
                  name
                  title
                  config
                  visibility
                  draftStep
                  signatureProviderType
                  updatedAt
                  archivedAt
                  expiresAt
                  versionNumber
                }
              }     
		  `,
            variables: {
                "eid": weldEid,
                "config": configData
            }
        });

    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://graphql.useanvil.com',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': basicAuth
        },
        data: data
    };

    axios(config)
        .then(function async(response) {
            // console.log(res, 'res')
            // res.send(response.data)
            res.send(response.data)

            // console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {

            let { response } = error
            console.log(response.data);
            res.send(error)
        });
})

app.post("/createWorkflow", async (req, res) => {
    let { castId, name } = req.body
    let data = JSON.stringify({
        query: `mutation CreateWeld(
            $organizationEid: String!
            $name: String!
            $slug: String
            $visibility: String
            $castEid: String
            $draftStep: String
          ) {
            createWeld(
              organizationEid: $organizationEid
              slug: $slug
              name: $name
              visibility: $visibility
              castEid: $castEid
              draftStep: $draftStep
            ) {
              id
              eid
              slug
              name
              visibility
              draftStep
              config
              createdAt
              updatedAt
              organization {
                id
                eid
                slug
                name
              }
              casts {
                id
                eid
                type
                name
                title
                config
                location
                createdAt
                updatedAt
                versionNumber
                }
              forges {
                id
                eid
                slug
                name
            }
            }
          }
		  `,
        variables: {
            "organizationEid": "f2AzCk56ltQW3xPZB2Rt",
            "castEid": castId,
            "name": name,


        }
    });

    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://graphql.useanvil.com',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': basicAuth
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            // console.log(res, 'res')
            res.send(response.data)
            // res.send(response.data)
            // console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {

            let { response } = error
            console.log(response.data);
            res.send(error)
        });

})

const generateWorkflowUrl = (dataResp) => {

    let data = JSON.stringify({
        query: `mutation (
            $forgeEid: String!,
            $weldDataEid: String,
            $submissionEid: String,
            $payload: JSON!,
            $currentStep: Int,
            $complete: Boolean,
            $isTest: Boolean=false,
            $timezone: String,
            $webhookURL: String 
        ) {
            forgeSubmit (
                forgeEid: $forgeEid,
                weldDataEid: $weldDataEid,
                submissionEid: $submissionEid,
                payload: $payload,
                currentStep: $currentStep,
                complete: $complete,
                isTest: $isTest,
                timezone: $timezone,
                webhookURL: $webhookURL
            ) {
                eid
                payload
                continueURL
                status
                completedAt
            }
        }        
		  `,
        variables: {
            "forgeEid": dataResp.forges[0].eid,
            "payload": {},
            "currentStep:": 2,
            "isTest": false,
            "complete": false
        }
    });

    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://graphql.useanvil.com',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': basicAuth
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            // console.log(res, 'res')
            return new Promise((resolve, reject) => {
                resolve(response.data)
            })
            // console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            // return error
            return new Promise((resolve, reject) => {
                reject(error)
            })
            // let { errors } = error
            // console.log(JSON.stringify(errors), "error", { ...error });

            // res.send(error)
        });
}

app.post("/getWorkflow", async (req, res) => {
    let { webformSlug } = req.body
    let data = JSON.stringify({
        query: `query WeldQuery($organizationSlug: String!, $slug: String!) {
            data: weld(organizationSlug: $organizationSlug, slug: $slug) {
                id
                eid
                slug
                name
                title
                visibility
                config
                createdAt
                updatedAt
                organization {
                    id
                    slug
                }
                forges {
                    id
                    eid
                    slug
                    name
                }
                weldGroups {
                    id
                    eid
                    slug
                    name
                }
            }
        }        
		  `,
        variables: {
            "slug": webformSlug,
            "organizationSlug": "curately-ai"
        }
    });

    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://graphql.useanvil.com',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': basicAuth
        },
        data: data
    };

    axios(config)
        .then(function async(response) {
            // console.log(res, 'res')
            // res.send(response.data)
            res.send(response.data)

            // console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {

            let { errors } = error
            console.log(JSON.stringify(errors), "error", { ...error });
            res.send(error)
        });
})

app.post("/createWorkflowEmbeddedUrl", async (req, res) => {
    let { forgeEid } = req.body
    let data = JSON.stringify({
        query: `mutation (
            $forgeEid: String!,
            $weldDataEid: String,
            $submissionEid: String,
            $payload: JSON!,
            $currentStep: Int,
            $complete: Boolean,
            $isTest: Boolean=false,
            $timezone: String,
            $webhookURL: String 
        ) {
            forgeSubmit (
                forgeEid: $forgeEid,
                weldDataEid: $weldDataEid,
                submissionEid: $submissionEid,
                payload: $payload,
                currentStep: $currentStep,
                complete: $complete,
                isTest: $isTest,
                timezone: $timezone,
                webhookURL: $webhookURL
            ) {
                eid
                payload
                continueURL
                status
                completedAt
            }
        }        
		  `,
        variables: {
            "forgeEid": forgeEid,
            "payload": {},
            "currentStep:": 2,
            "isTest": false,
            "complete": false
        }
    });

    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://graphql.useanvil.com',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': basicAuth
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            // console.log(res, 'res')
            res.send(response.data)
            // console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {

            let { response } = error
            console.log(response.data);
            res.send(error)
        });
})

app.post("/downloadDocuments", async (req, res) => {
    try {
        const { weldDataEid } = req.body
        // const { data } = await anvilClient.getEtchPacket({
        //     variables: { eid: signerEid },
        // })
        // console.log(signaturePacketEid, 'signaturePacketEid')
        // // We only have 1 signer for this signature packet
        // console.log(data, "data here")
        // const signers = data.data.etchPacket.documentGroup.signers
        // const signerEid = signers[0].eid
        // console.log(signers, 'signers', signerEid)
        // The signing URL generated here is used to
        // embed the signing page into our app
        const zipResponse = await anvilClient.downloadDocuments(weldDataEid)
        // console.log(JSON.stringify(zipResponse))
        fs.writeFileSync('workflowDocuments.zip', zipResponse.data)

        res.send(zipResponse)
    }
    catch (e) {
        console.log(e, 'e')
        res.send(e)
    }
})

app.get('/download/:eid.zip', (req, resp) => {
    const { eid } = req.params

    // Authenticate / authorize your user here!

    const anvilDownloadURL = `https://app.useanvil.com/download/${eid}.zip`

    // Authenticate to Anvil with your Anvil API key
    // const encodedToken = Buffer.from(`${ANVIL_API_KEY}:`, 'ascii').toString(
    //   'base64'
    // )
    const downloadOptions = {
        method: 'get',
        headers: { Authorization: `Basic ${encodedToken}` },
    }

    fetch(anvilDownloadURL, downloadOptions).then((downloadResponse) => {
        downloadResponse.headers.forEach((v, n) => resp.setHeader(n, v))
        resp.send(downloadResponse)
    })
})

app.post("/weldData", (req, res) => {
    let { weldDataEid } = req.body
    let data = JSON.stringify({
        query: `query weldData($eid: String!) {
            weldData(eid: $eid) {
              eid
              files
            }
          }     
		  `,
        variables: {
            "eid": weldDataEid
        }
    });

    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://graphql.useanvil.com',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': basicAuth
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            // console.log(res, 'res')
            res.send(response.data)
            // console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {

            let { errors } = error
            console.log(JSON.stringify(errors), "error", { ...error });
            res.send(error)
        });
})

app.get('/generateEmbeddedUrl', (req, res) => {
    // let data = {
    // 	"AllowedDomains": ["http://localhost:3000"],
    // 	"ExperienceConfiguration": {
    // 		"QuickSightConsole": {
    // 			"FeatureConfigurations": {
    // 				"StatePersistence": {
    // 					"Enabled": true
    // 				}
    // 			},
    // 			"InitialPath": "/start"
    // 		}
    // 	},
    // 	"SessionLifetimeInMinutes": 600,
    // 	"UserArn": "arn:aws:iam::068652499116:user/shantanu"
    // }
    // try {
    // 	var config = {
    // 		method: 'post',
    // 		url: 'https://us-west-2.quicksight.aws.amazon.com/sn/accounts/068652499116/embed-url/registered-user',
    // 		headers: {
    // 			'Content-Type': 'application/json',

    // 		},
    // 		data: data
    // 	};

    // 	axios(config)
    // 		.then(function (response) {
    // 			console.log(res, 'res')
    // 			res.send(response.data)
    // 			// console.log(JSON.stringify(response.data));
    // 		})
    // 		.catch(function (error) {

    // 			let { errors } = error
    // 			console.log(JSON.stringify(errors), "error", { ...error });
    // 			res.send(error)
    // 		});
    // }
    // catch (e) {
    // 	console.log(e, 'e')
    // 	res.send(e)
    // }
    quicksightClient.generateEmbedUrlForRegisteredUser({
        'AwsAccountId': '068652499116',
        'ExperienceConfiguration': {
            'QuickSightConsole': {
                'InitialPath': '/start'
            }
        },
        'UserArn': 'arn:aws:quicksight:us-west-2:068652499116:user/default/shantanu',
        'AllowedDomains': ["http://localhost:3000", "https://app.curately.ai"],
        'SessionLifetimeInMinutes': 100
    }, function (err, data) {
        console.log('Errors: ');
        console.log(err);
        if (data) {
            res.send(data)
        }
        console.log('Response: ');
        console.log(data);
    });
})
