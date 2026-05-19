#
# Lambda function: current weather for a city via Open Meteo.
#
import json
import requests
from urllib.parse import unquote_plus

WEATHER = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Drizzle: light",
    53: "Drizzle: moderate",
    55: "Drizzle: dense",
    56: "Freezing drizzle: light",
    57: "Freezing drizzle: dense",
    61: "Rain: slight",
    63: "Rain: moderate",
    65: "Rain: heavy",
    66: "Freezing rain: light",
    67: "Freezing rain: heavy",
    71: "Snow fall: slight",
    73: "Snow fall: moderate",
    75: "Snow fall: heavy",
    77: "Snow grains",
    80: "Rain showers: slight",
    81: "Rain showers: moderate",
    82: "Rain showers: violent",
    85: "Snow showers: slight",
    86: "Snow showers: heavy",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


def _respond(status_code, message, temperature=None, windspeed=None, winddirection=None, synopsis=None):
    body = {"message": message}
    if status_code == 200:
        body["temperature"] = temperature
        body["windspeed"] = windspeed
        body["winddirection"] = int(winddirection)
        body["synopsis"] = synopsis
    return {"statusCode": status_code, "body": json.dumps(body)}


def _open_meteo_error(resp):
    try:
        data = resp.json()
        if isinstance(data, dict) and "reason" in data:
            return data["reason"]
    except Exception:
        pass
    return f"Open Meteo returned status {resp.status_code}"


def lambda_handler(event, context):
    try:
        print("**Call to weather...")

        if not event.get("pathParameters"):
            raise Exception("request has no pathParameters")

        params = event["pathParameters"]
        if "country" not in params or "city" not in params:
            raise Exception("request has no country or city")

        country = params["country"].upper()
        city = unquote_plus(params["city"])
        print("country:", country, "city:", city)

        geo_url = (
            "https://geocoding-api.open-meteo.com/v1/search"
            f"?name={requests.utils.quote(city)}&count=1&countryCode={country}"
        )
        print("**Geocoding:", geo_url)
        geo_resp = requests.get(geo_url, timeout=30)
        if geo_resp.status_code != 200:
            return _respond(500, _open_meteo_error(geo_resp))

        geo_body = geo_resp.json()
        if "results" not in geo_body or not geo_body["results"]:
            return _respond(400, "no such country or city")

        loc = geo_body["results"][0]
        lat = round(loc["latitude"], 2)
        lon = round(loc["longitude"], 2)
        print("lat:", lat, "lon:", lon)

        forecast_url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            "&current_weather=true"
            "&temperature_unit=fahrenheit"
            "&wind_speed_unit=mph"
        )
        print("**Forecast:", forecast_url)
        wx_resp = requests.get(forecast_url, timeout=30)
        if wx_resp.status_code != 200:
            return _respond(500, _open_meteo_error(wx_resp))

        wx_body = wx_resp.json()
        current = wx_body.get("current_weather")
        if not current:
            return _respond(500, "Open Meteo response missing current_weather")

        weathercode = current["weathercode"]
        synopsis = WEATHER.get(weathercode, f"unknown weather code {weathercode}")

        return _respond(
            200,
            "success",
            temperature=current["temperature"],
            windspeed=current["windspeed"],
            winddirection=current["winddirection"],
            synopsis=synopsis,
        )

    except Exception as e:
        print("**Exception:", str(e))
        if str(e).startswith("request has no"):
            return _respond(400, str(e))
        return _respond(500, str(e))
