const express = require("express");
const cors = require('cors');
const pipedrive = require('pipedrive');
require('dotenv').config();

const defaultClient = new pipedrive.ApiClient();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

app.use(express.static('css'));
app.use(express.static('pages'));
app.use(express.static('pics'));

defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

async function addDeal(data) {
    try {
        console.log('Sending request...');

        const api = new pipedrive.DealsApi(defaultClient);
        const response = await api.addDeal(data);

        console.log('Deal was added successfully!', response);
        return response;
    } catch (err) {
        const errorToLog = err.context?.body || err;
        console.log('Adding failed', errorToLog);
        throw errorToLog;
    }
}

app.post("/add-deal", async function (req, res) {
    if (!req.body) return res.sendStatus(400);

    const data = req.body;

    const dealData = {
        title: `Deal of ${data.firstName} ${data.lastName}`,
        value: 0,
        currency: 'USD',
        user_id: null,
        person_id: null,
        org_id: 1,
        stage_id: 1,
        status: 'open',
        expected_close_date: data.startDate,
        probability: 60,
        lost_reason: null,
        visible_to: 1,
        add_time: new Date().toISOString(),
        custom_fields: {
            phone: data.phone,
            email: data.email,
            jobType: data.jobType,
            source: data.source,
            jobDescription: data.jobDescription,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            area: data.area,
            startDate: data.startDate,
            startTime: data.startTime,
            endTime: data.endTime,
            priority: data.priority,
        }
    };

    try {
        console.log('Отправляем данные в Pipedrive:', dealData);
        const dealResponse = await addDeal(dealData);
        console.log('Ответ от Pipedrive:', dealResponse);
        res.sendFile(__dirname + '/result.html');
    } catch (err) {
        console.error('Ошибка при добавлении сделки:', err);
        res.status(500).send('Failed to add deal');
    }
});

app.listen(3000, () => console.log("Сервер запущен..."));
