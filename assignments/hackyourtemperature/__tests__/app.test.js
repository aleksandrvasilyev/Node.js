import app from "../server.js";
import supertest from "supertest";
import { API_KEY } from "../sources/keys.js";
import nock from "nock";
const request = supertest(app);

describe("POST /", (done) => {
  afterEach(() => {
    nock.cleanAll();
  });

  it("main page works", () => {
    request
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("hello from backend to frontend!");
      });
  });

  it("user provide correct city name and has a response", async () => {
    const mockCity = "Amsterdam";
    const mockTemp = 15;

    nock("https://api.openweathermap.org")
      .get("/data/2.5/weather")
      .query({ q: mockCity, APPID: API_KEY, units: "metric" })
      .reply(200, { name: "Amsterdam", main: { temp: 15 } });

    const res = await request
      .post("/weather")
      .send({ cityName: "Amsterdam" })
      .expect(200);

    expect(res.body).toEqual({
      Amsterdam: 15,
    });
  });

  it("user does not provide city name", async () => {
    await request
      .post("/weather")
      .send()
      .set("Content-type", "application/json")
      .set("Accept", "application/json")
      .expect(400, {
        weatherText: "City name is required!",
      });
  });

  it("user provides gibberish city name", async () => {
    await request
      .post("/weather")
      .send({ cityName: "abcdefg" })
      .set("Content-type", "application/json")
      .set("Accept", "application/json")
      .expect(404, {
        weatherText: "City is not found!",
      });
  });
});
