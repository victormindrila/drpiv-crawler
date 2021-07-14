const axios = require('axios');
const cron = require('node-cron');
const http = require('http');

const requestListener = function(req, res) {
	res.writeHead(200);
	res.end('Hello, World!');
};

const server = http.createServer(requestListener);

const sendEmail = require('./mailer');

const go = async () => {
	console.log('running');

	const d = new Date();

	const startMonth = d.getMonth() + 1;
	const date = d.getDate() + 1;
	const year = d.getFullYear();
	const endMonth = startMonth + 1;

	const start = [ year, startMonth, date ].join('-');
	const end = [ year, endMonth, date ].join('-');

	const url = `https://www.drpciv.ro/drpciv-booking-api/getCalendar?start=${start}&end=${end}&activityCode=4&countyCode=23`;

	const res = await axios.get(url).catch((error) => console.log(error));

	const availableDates = Object.keys(res.data);

	const template =
		availableDates.length === 0
			? '<p>Nu exista programari disponibile in urmatoarea luna</p>'
			: `
	<body>
    <p>Au aparut urmatoarele programari disponibile:</p>
	  <table>
	    <tbody>
	      ${availableDates.map((date) => {
					return `<tr>
	            <td>
	              ${date}
	            </td>
	          </tr>`;
				}).join(`
	        `)}
	    </tbody>
	  </table>
	</body>
	`;

	const emailOptions = {
		subject: 'Programari disponibile',
		html: template,
		to: process.env.EMAIL,
		from: process.env.EMAIL
	};

	try {
		sendEmail(emailOptions);
	} catch (error) {
		console.log(error);
	}
};

//schedule
// cron.schedule('1 * * * * *', go);
cron.schedule('1 * * * * *', go);

//ping listener
server.listen(process.env.PORT || 3000);
