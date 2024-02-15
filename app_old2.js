

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
app.use(express.json());
app.use(cors({
	origin: ['http://localhost:3001', "https://app.curately.ai", 'http://localhost:4200']
}));

const getTemplates = () => {

}










// The ID of the PDF template to fill
const pdfTemplateID = '2Oac1eKLbkYtj8NASclu'
// Your API key from your Anvil organization settings
const apiKey = '3omv8BJAYGmo8xscUj59vu9zpvcsl4Tu'
const anvilClient = new Anvil({ apiKey })

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

const packetSigners = [
	{
		id: "signer1",
		// Important! This tells Anvil that our app will be
		// notifying the signer when it is their turn to sign
		signerType: 'embedded',
		// Important! This tells Anvil to redirect to this URL
		// after the signer has completed their signatures
		redirectURL: '/onboarding/finish',

		// fields left undefined to be filled using webform input
		name: "phani",
		email: "akunde@ovahq.com",
		tokenValidForMinutes: 60 * 24 * 3,
		fields: [
			{
				fileId: 'payroll1',
				fieldId: 'signatureOne',
			},
		],
	}
]

const encodedToken = Buffer.from('3omv8BJAYGmo8xscUj59vu9zpvcsl4Tu:', 'ascii').toString('base64')
const basicAuth = `Basic ${encodedToken}`

// const packetPrefillData = {
// 	payroll1: {
// 		data: {
// 			// fields left undefined to be filled using webform input
// 			"accountNumber0": "45785587",
// 			"routingNumber0": "789854225",
// 			"accountNumber1": "125478958",
// 			"jointAccountHolderName": {
// 				"firstName": "Phani kumar",
// 				"mi": "",
// 				"lastName": "Ankem"
// 			},
// 			"date": "2023-12-14",
// 			"routingNumber1": "32545654",
// 		},
// 	},
// }



const signaturePacketVariables = {
	isDraft: false,
	isTest: false,
	files: packetFiles,
	signers: [
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
			name: undefined,
			email: undefined,
			fields: [
				// {
				// 	fileId: 'payroll1',
				// 	fieldId: 'signatureOne',
				// },
			],
		}
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
	var data = JSON.stringify({
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
		  }
		  `,
		variables: { eid, versionNumber: -3 }
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
		.then(function (response) {
			// console.log(res, 'res')
			res.send(response.data)
			// console.log(JSON.stringify(response.data));
		})
		.catch(function (error) {
			console.log(error);
			res.send(error)
		});
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
		let signFields = []
		signerFields.forEach(element => {
			signFields.push({
				fileId: signaturePacketVariables.files[0].id,
				fieldId: element
			})
		});
		signaturePacketVariables.signers[0].fields = signFields

		console.log(JSON.stringify(signaturePacketVariables))
		// console.log(signaturePacketVariables, 'signaturePacketVariables')
		const {
			statusCode, data, errors
		} = await anvilClient.createEtchPacket({ variables: signaturePacketVariables })
		console.log("errors 1", errors)
		const signaturePacketEid = data.data.createEtchPacket.eid


		// Add the new post to the list of posts
		res.send({ packetId: signaturePacketEid });
	}

	catch (e) {
		res.send(e)
		console.log(e, "error")
	}


});

app.post('/editTemplate', (req, resp) => {

	let { castId } = req.body
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
		variables: {
			"type": "edit-pdf-template",
			"eid": castId,
			// "validUntil": "2024-06-12T01:43:50+00:00",
			"validForSeconds": 86400,
			"options": {
				"mode": "preset-fields",
				"pageTitle": "Title of the page",
				"title": "Sidebar title",
				description: 'Please draw fields indicated below.',
				selectionDescription:
					'Select the field that best represents the box drawn.',
				showPageTitleBar: false,
				// finishButtonText: 'Custom text',
				// selectionAddAnotherFieldText: 'Plz add another field',
				fields: [
					// * `aliasId` can be anything you'd like: https://www.useanvil.com/docs/api/fill-pdf/#field-ids
					// * All types: https://www.useanvil.com/docs/api/fill-pdf/#all-field-types
					{
						name: 'Full name',
						type: 'fullName',
						aliasId: 'name',
						required: false,

						// optional fields
						alignment: 'center', // `left`, `center`, `right`
						fontSize: '12',
						fontWeight: 'boldItalic', // 'normal', `bold`, `boldItalic`, `italic`
						fontFamily: 'Futura', // Any google font, 'Helvetica', 'Times new roman', 'Courier'
						textColor: '#a00000',
					},
					{
						name: 'Email',
						type: 'email',
						aliasId: 'email',
						required: false,
					},
					{
						name: 'Date of birth',
						type: 'date',
						aliasId: 'dob',
						required: false,

						// optional date fields:
						format: 'MMMM Do YYYY', // see moment.js docs
					},
					{
						name: 'Client signature',
						type: 'signature',
						aliasId: 'clientSignature',
						required: false,
					},
					{
						name: 'Sales signature',
						type: 'signature',
						aliasId: 'salesSignature',
						required: false,
					},
					{
						name: 'Client initials',
						type: 'initial',
						aliasId: 'clientInitials',
						required: false,
					},
					{
						name: 'Client signature date',
						type: 'signatureDate',
						aliasId: 'clientSignatureDate',
						required: false,
					},
					{
						name: 'Job Title',
						type: 'shortText',
						aliasId: 'job_title',
						required: false,
					},
				],
			},
			// "metadata": {"internalUserId": 123}
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
			resp.send(response.data)
			// console.log(JSON.stringify(response.data));
		})
		.catch(function (error) {

			let { errors } = error
			console.log(JSON.stringify(errors), "error", { ...error });
			resp.send(error)
		});

})


app.post('/createSignUrl', async (req, res) => {

	try {
		const { signaturePacketEid, clientUserId } = req.body
		const { data } = await anvilClient.getEtchPacket({
			variables: { eid: signaturePacketEid },
		})
		console.log(signaturePacketEid, 'signaturePacketEid')
		// We only have 1 signer for this signature packet
		console.log(data, "data here")
		const signers = data.data.etchPacket.documentGroup.signers
		const signerEid = signers[0].eid
		console.log(signers, 'signers', signerEid)
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

app.get("/generateCode", async (req, res) => {
	axios.get(`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86jiupig4avfpj&redirect_uri=http://localhost:4200&scope=openid email profile`)
		.then(function (response) {
			// handle success
			console.log(response);
			res.send(JSON.stringify(response.data))
		})
		.catch(function (error) {
			// handle error
			res.send(error)
		})
})