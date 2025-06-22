const express = require("express");
const axios = require("axios");
const moment = require("moment-timezone");

const app = express();
app.use(express.json());

const OPENWEATHER_API_KEY = "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}";
const GOOGLE_API_KEY = "AIzaSyAUkcBefkXkcEOVsH8sq3409cipw4533F0";

// Ruta del webhook que Dialogflow llamará
app.post("/webhook", async (req, res) => {
  const parameters = req.body.queryResult.parameters;

  if (parameters["geo-coordinates"]) {
    const { latitude, longitude } = parameters["geo-coordinates"];

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const tz = await axios.get(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=${GOOGLE_API_KEY}`
      );

      const timeZoneId = tz.data.timeZoneId;
      const hora = moment().tz(timeZoneId).format("HH:mm");

      const clima = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`
      );
      const desc = clima.data.weather[0].description;
      const temp = clima.data.main.temp;

      const responseText = `📍 Ubicación: ${latitude}, ${longitude}\n🕒 Hora local: ${hora}\n🌤️ Clima: ${desc}, ${temp}°C`;

      return res.json({ fulfillmentText: responseText });
    } catch (e) {
      return res.json({ fulfillmentText: "Error al obtener el clima o la hora." });
    }
  }

  res.json({ fulfillmentText: "Por favor, comparte tu ubicación (lat, lon)." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor webhook activo en puerto", PORT));
