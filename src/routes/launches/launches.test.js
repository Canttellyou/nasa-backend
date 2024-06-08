const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => {
    beforeAll(async () => {
        await mongoConnect();
    })

    afterAll(async () => {
        await mongoDisconnect();
    })

    describe('Test GET /launches', () => {
        test('It should respond with 200 success', async () => {
            const response = await request(app).get('/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        })
    })

    describe('Test POST /launches', () => {
        const completeLaunchData = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            launchDate: 'January 4, 2028',
            target: 'Kepler-186 f'
        };

        const launchDataWithoutDate = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-186 f'
        };

        const launchDataWithIncorrectDate = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            launchDate: 'Januay',
            target: 'Kepler-186 f'
        };


        test('It should respond with 201 success', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);

            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);

            expect(response.body).toMatchObject(launchDataWithoutDate)
        })

        test('It should catch missing required parameters', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({ error: "Missing required field" })
        })

        test('It should catch invalid dates', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithIncorrectDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({ error: "Invalid launch date" })
        })
    })
})

