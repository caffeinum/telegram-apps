# @telegram-apps/generate-mock-session

A simple CLI tool to generate mock sessions for Telegram Mini Apps.

## Installation

```bash
npm install -g @telegram-apps/generate-mock-session
```

## Usage

You can use this tool in two ways:

1. Using command-line arguments:
```bash
generate-mock-session <USER_ID>
```

2. Using environment variables:

```bash
MOCK_USER_ID=1234567 generate-mock-session
```

Make sure to set the following environment variables:

- `TELEGRAM_BOT_TOKEN`: Your Telegram Bot Token
- `NEXT_PUBLIC_MINI_APP_URL`: The URL of your Mini App (default: `http://localhost:3000`)
- `PORT`: The port number for your local server (default: 3000)

You can set these in a `.env` file in the directory where you're running the command.

## Output

The tool will output a login URL that you can use to test your Mini App with a mock session.

## Notes

- This tool is intended for development and testing purposes only.
- The generated session is not secure and should not be shared.
- Use with caution and only on secure development environments.
- If `NEXT_PUBLIC_MINI_APP_URL` is not provided, it defaults to `http://localhost:3000` (or the port specified by the `PORT` environment variable).

## License

MIT
