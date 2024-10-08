# Open AI Playground

This repository is a personal project space to experiment with the OpenAI API:

## Features

### CAD PDF Drawing Upload and Parsing

- **Upload Feature**: Upload CAD PDF drawings directly through the UI.
- **PDF Parsing**: Parse the uploaded PDF to extract text.
- **Data Extraction Using OpenAI API**: Use OpenAI API to extract fields such as the part number, description, and revision from the parsed PDF text. It also suggests necessary operations/steps to manufacture the part (e.g., milling, galvanizing, laser cutting, etc.) based on the information in the drawing.

![PDF Scanner](https://raw.githubusercontent.com/ubemacapuno/images-for-github-readme/main/pdf-scanner.webp)

### Bug Ticket Generator

- **Issue Summary Submission**: Users can submit a summary of their issue through the UI.
- **PDF-Generator API Integration**: The PDF-Generator API automatically fills in a JSON template with the issue details, including:
  - **Title**: The title of the bug.
  - **Description**: A detailed description of the issue.
  - **Acceptance Criteria**: A list of conditions that must be met for the bug to be considered resolved.
  - **Steps To Reproduce**: Ordered steps to reproduce the bug.
  - **Technical Notes**: Any technical notes or comments related to the bug.
  - **Priority**: The priority level of the bug (Low, Medium, High).
  - **Labels**: Tags or labels associated with the bug for categorization.
  - **Assignee**: The individual assigned to address the bug.

![Ticket Generator](https://raw.githubusercontent.com/ubemacapuno/images-for-github-readme/main/ticket-generator.webp)

## Future Enhancements

- **CSV File Parsing**: Plans to support uploading and parsing CSV files to extract relevant information using the OpenAI API.
- **Expanded Data Extraction**: Extend the capabilities to extract additional fields and possibly support more document types beyond PDFs and CSVs.

## Getting Started

1. **Clone the Repository**

```bash
git clone https://github.com/ubemacapuno/open-ai-playground.git
cd open-ai-playground
```

2. **Install Dependencies**

```bash
pnpm install
```

3. **Set Up Environment Variables**

See the [official OpenAI API documentation](https://help.openai.com/en/articles/9186755-managing-your-work-in-the-api-platform-with-projects) for setting up an OpenAI API key.

```
OPENAI_API_KEY=your_openai_api_key_here
```

See the [official Pocketbase documentation](https://pocketbase.io/docs/) for setting up a database

```
PUBLIC_POCKETBASE_URL=your_pocketbase_server_url
```

4. **Run the Application**

```bash
pnpm run dev
```

## Contributing

This is a personal project, but suggestions and feedback are welcome. Please open an issue to discuss any changes you'd like to propose.
