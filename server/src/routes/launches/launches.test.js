const request = require("supertest");
const app = require("../../app");
const { mongoConnect, disconnectMongo } = require("../../services/mongo");

describe("Launches API", () => {
  beforeAll(() => {
    mongoConnect();
  });

  afterAll(async () => {
    await disconnectMongo();
  });

  describe("Test GET /launches", () => {
    test("It should return 200", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
      // expect(response.statusCode).toBe(200);
    });
  });

  describe("Test POST /launches", () => {
    const requestObject = {
      mission: "Kepler exploration X",
      rocket: "Explorer IS1",
      launchDate: "Oct 19,2024",
      target: "Kepler-442 b",
    };

    const requestObjectWithoutDate = {
      mission: "Kepler exploration X",
      rocket: "Explorer IS1",
      target: "Kepler-442 b",
    };
    test("It should return 201", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(requestObject)
        .expect("Content-Type", /json/)
        .expect(201);
      const requestDate = new Date(requestObject.launchDate).valueOf();
      const responsetDate = new Date(response.body.launchDate).valueOf();

      expect(requestDate).toBe(responsetDate);
    });

    test("It should return 400", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(requestObjectWithoutDate)
        .expect(400);

      expect(response.body).toStrictEqual({ error: "Missing properties" });
      console.log(Object.assign(requestObject, { launchDate: "hello" }));

      await request(app)
        .post("/v1/launches")
        .send(Object.assign(requestObject, { launchDate: "hello" }))
        .expect(400);
    });
  });
});
