# Open AI Playground

This repository is designed as a personal project space to experiment with and leverage the capabilities of the OpenAI API. The focus is on parsing and extracting data from various formats, starting with CAD PDF drawings and potentially expanding to other types of documents and data formats.

## Features

### CAD PDF Drawing Upload and Parsing

- **Upload Feature**: Users can upload CAD PDF drawings directly through the UI.
- **PDF Parsing**: The application parses the uploaded PDFs to extract text.
- **Data Extraction Using OpenAI API**: Utilizes the OpenAI API to intelligently extract specific fields such as the part name, description, and revision from the parsed PDF text.

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

```
pnpm install
```

3. **Set Up Environment Variables**

See the [official OpenAI API documentation](https://help.openai.com/en/articles/9186755-managing-your-work-in-the-api-platform-with-projects) for setting up an OpenAI API key.

```
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Run the Application**

```
pnpm run dev
```
