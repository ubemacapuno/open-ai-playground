# Open AI Playground

This repository is a personal project space to experiment with and showcase various implementations of OpenAI API, including a bug ticket generator and engineering CAD drawing PDF parser.

> **Note:** This project is currently in active development, and I'm working on deploying a live demo. Please run locally for now with your own Open AI API an Pocketbase credentials.

## Key Features (In Development)

- CAD PDF Drawing Upload and Parsing
  - Upload CAD PDF drawings through the UI
  - Parse uploaded PDFs to extract text
  - Use OpenAI API to extract key fields and suggest manufacturing steps
- Bug Ticket Generator
  - Submit issue summaries through the UI
  - Automatically generate detailed bug tickets using the OpenAI API

## Feature Previews

### CAD PDF Drawing Upload and Parsing

![PDF Scanner](https://raw.githubusercontent.com/ubemacapuno/images-for-github-readme/main/pdf-scanner.webp)

### Bug Ticket Generator

![Ticket Generator](https://raw.githubusercontent.com/ubemacapuno/images-for-github-readme/main/ticket-generator.webp)

## Current Status

Open AI Playground is in its early stages. Here's a rough overview of current MVP progress:

- [ ] Deploy a LIVE DEMO (currently runs locally only)
- [x] Project setup and configuration
- [x] CAD PDF upload and parsing functionality
- [x] Bug ticket generator implementation
- [ ] User interface refinements/mobile
- [ ] Error handling and input validation
- [ ] Performance optimizations

## Stack

- Frontend:
  - [SvelteKit](https://kit.svelte.dev/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [shadcn-svelte](https://www.shadcn-svelte.com/)
- Backend:
  - [SvelteKit](https://kit.svelte.dev/)
  - [OpenAI API](https://openai.com/api/)
- Database:
  - [PocketBase](https://pocketbase.io/)

## Setup

1. Clone the repository:

```sh
git clone https://github.com/ubemacapuno/open-ai-playground.git
cd open-ai-playground
```

2. Install dependencies:

```sh
pnpm install
```

3. Set up environment variables:

Create a `.env` file in the root directory and add the following:

```
OPENAI_API_KEY=your_openai_api_key_here
PUBLIC_POCKETBASE_URL=your_pocketbase_server_url
```

See the [official OpenAI API documentation](https://help.openai.com/en/articles/9186755-managing-your-work-in-the-api-platform-with-projects) for setting up an OpenAI API key.

See the [official Pocketbase documentation](https://pocketbase.io/docs/) for setting up a database.

4. Run the application:

```sh
pnpm run dev
```

## Future Improvements

Here are some exciting features I'd like to implement in the future:

- CSV File Parsing: Support uploading and parsing CSV files to extract relevant information using the OpenAI API
- Expanded Data Extraction: Extend capabilities to extract additional fields and support more document types beyond PDFs and CSVs.
- Google OAuth
