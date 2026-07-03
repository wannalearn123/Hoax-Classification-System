# TrackingApp

A community health app where leaders monitor members and send alerts for missed training.

## Setup (for Development)

1. Install Docker.
2. Navigate to `src/` directory.
3. Run `docker compose up -d`.

## Access the App

- **Via Apache**: Open `http://localhost:8080` in your browser.
- **Via PHP Spark Serve**: Run `docker compose exec app php spark serve --host 0.0.0.0 --port 8080`, then open `http://localhost:8080`.

## Troubleshooting

If you get writing errors or 403 Forbidden:
- Run `docker compose exec app bash`.
- Inside the container: `chown -R www-data:www-data .`
- If still failing, rebuild: `docker compose down && docker compose build --no-cache && docker compose up -d