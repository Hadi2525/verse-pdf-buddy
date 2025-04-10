# Verse PDF Buddy - Documentation

## Project Overview

Verse PDF Buddy is your intelligent companion for unlocking the knowledge hidden within PDF documents. This innovative web application empowers you to effortlessly upload PDF files, intelligently extract text using Optical Character Recognition (OCR), generate insightful embeddings with Google's Gemini model, and perform lightning-fast semantic searches. Comprising a robust FastAPI backend, a sleek React frontend, and leveraging powerful cloud services like Google Cloud Run, Google Cloud Artifact Registry, and Mistral AI OCR, Verse PDF Buddy is designed to make your document exploration seamless and efficient.

## Table of Contents

- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Architecture](#architecture)
  - [Backend (FastAPI)](#backend-fastapi)
  - [Frontend (React)](#frontend-react)
  - [Services and Components](#services-and-components)
- [Endpoints](#endpoints)
- [Dockerfile](#dockerfile)
- [Deployment](#deployment)
  - [Pushing to Google Cloud Artifact Registry](#pushing-to-google-cloud-artifact-registry)
  - [Building and Deploying to Google Cloud Run](#building-and-deploying-to-google-cloud-run)
- [Local Setup](#local-setup)
  - [Prerequisites](#prerequisites)
  - [Setting up the Repository](#setting-up-the-repository)
  - [Running Locally](#running-locally)
  - [Running the Docker Image Locally](#running-the-docker-image-locally)
- [Environment Variables](#environment-variables)
  - [Frontend Environment Variables](#frontend-environment-variables)
  - [Backend Environment Variables](#backend-environment-variables)
- [Debugging](#debugging)
- [Contributing](#contributing)
- [Upcoming Updates](#upcoming-updates)

## Technologies Used

- **Backend**: FastAPI (Python) - A high-performance web framework for building APIs.
- **Frontend**: React (TypeScript) - A dynamic JavaScript library for building user interfaces.
- **OCR**: Mistral AI OCR - Cutting-edge Optical Character Recognition for accurate text extraction.
- **Embeddings**: Google Gemini Model, Google Embeddings - State-of-the-art models for semantic understanding.
- **Cloud Services**: Google Cloud Run, Google Cloud Artifact Registry - Scalable and reliable cloud infrastructure.
- **UI Library**: shadcn-ui - A collection of reusable components for building modern user interfaces.
- **Styling**: Tailwind CSS - A utility-first CSS framework for rapid UI development.
- **Package Manager**: npm - The standard package manager for JavaScript.

## Architecture

### Backend (FastAPI)

The backend, built with FastAPI, serves as the application's intelligent core. It expertly manages PDF uploads, performs OCR processing, generates embeddings, and handles complex search queries with remarkable efficiency.

Key functionalities:

- **PDF Processing**: Intelligently extracts text from uploaded PDFs, preparing it for further analysis.
- **OCR Service**: Leverages Mistral AI OCR to accurately convert images within PDFs into machine-readable text.
- **Embedding Generation**: Harnesses the power of Google's Gemini model to generate embeddings, capturing the semantic essence of the extracted text.
- **Search API**: Provides a robust endpoint for conducting semantic searches on the generated embeddings, delivering highly relevant results.

### Frontend (React)

The frontend is a responsive single-page application crafted with React and TypeScript. It offers an intuitive user interface for effortlessly uploading PDFs and displaying search results in a clear, concise manner.

Key features:

- **PDF Upload**: Enables users to seamlessly upload PDF documents directly through the browser.
- **Search Interface**: Features a prominent search bar, empowering users to enter their queries with ease.
- **Results Display**: Presents search results in an organized and user-friendly format, highlighting the most relevant information.

The frontend is meticulously built as static artifacts, ensuring optimal performance and is served directly from the backend for a streamlined user experience.

### Services and Components

- **Mistral AI OCR**: Powers the application's ability to recognize and extract text from images, ensuring no information is left behind.
- **Google Gemini Model**: Drives the semantic search capabilities by generating high-quality embeddings that capture the meaning of the text.
- **Google Embeddings**: Provides a scalable and efficient solution for storing and querying embeddings, enabling rapid search results.
- **Google Cloud Run**: Offers a fully managed environment for hosting the application, ensuring high availability and scalability.
- **Google Cloud Artifact Registry**: Securely stores the Docker image, providing a reliable source for deployments.

## Endpoints

### `/upload` (POST)

- **Workload**: Accepts a PDF file, intelligently extracts text using OCR, generates embeddings, and stores them for future searches.
- **Request Template**: `multipart/form-data` with a file field containing the PDF.
- **Response Template**:
  ```json
  {
    "filename": "example.pdf",
    "message": "File uploaded and processed successfully"
  }
  ```

### `/search` (GET)

- **Workload**: Accepts a search query, performs a semantic search across the stored embeddings, and returns the most relevant results.
- **Request Template**: `query` parameter in the URL, e.g., `/search?query=example`.
- **Response Template**:
  ```json
  [
    {
      "text": "Relevant text from the PDF",
      "similarity_score": 0.85
    },
    ...
  ]
  ```

## Dockerfile

The `Dockerfile` is carefully structured to create a fully containerized environment for the application, ensuring consistency across different deployment environments. Key elements include:

- Base image: `python:3.12` - Provides a stable and reliable foundation for the backend.
- Dependencies installation using `pip` - Ensures all necessary Python packages are installed.
- Copying the backend and frontend code - Integrates all application components into the container.
- Setting environment variables - Configures the application with the necessary settings.
- Defining the entry point to start the FastAPI application - Specifies how the application should be launched.

## Deployment

### Pushing to Google Cloud Artifact Registry

1.  Build the Docker image:

    ```sh
    docker build -t verse-pdf-buddy .
    ```

    This command creates a Docker image named `verse-pdf-buddy` using the `Dockerfile` in the current directory.
2.  Tag the image for Google Cloud Artifact Registry:

    ```sh
    docker tag verse-pdf-buddy:latest <REGION>-docker.pkg.dev/<PROJECT_ID>/<REPOSITORY>/verse-pdf-buddy:latest
    ```

    Replace `<REGION>`, `<PROJECT_ID>`, and `<REPOSITORY>` with your Google Cloud project details. This command tags the image with the correct registry path.
3.  Push the image:

    ```sh
    docker push <REGION>-docker.pkg.dev/<PROJECT_ID>/<REPOSITORY>/verse-pdf-buddy:latest
    ```

    This command uploads the Docker image to your Google Cloud Artifact Registry.

### Building and Deploying to Google Cloud Run

1.  Navigate to Google Cloud Run in the Google Cloud Console.
2.  Click "Create Service".
3.  Select "Deploy one revision from an existing container image".
4.  Specify the image URL from the Artifact Registry.
5.  Configure service settings such as region, memory allocation, and environment variables to match your application's needs.
6.  Click "Create" to deploy the service, making your application live on Google Cloud Run.

## Local Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js and npm - Essential for running the frontend.
- Python 3.12 or higher - Required for the backend.
- Docker (optional, for running the Docker image locally) - Simplifies deployment and ensures consistency.
- Google Cloud SDK (optional, for deploying to Google Cloud) - Enables interaction with Google Cloud services.

### Setting up the Repository

1.  Clone the repository:

    ```sh
    git clone <YOUR_GIT_URL>
    cd verse-pdf-buddy
    ```

    Replace `<YOUR_GIT_URL>` with the URL of your forked repository.
2.  Install backend dependencies:

    ```sh
    cd backend
    pip install -r requirements.txt
    cd ..
    ```

    This command installs all the necessary Python packages for the backend.
3.  Install frontend dependencies:

    ```sh
    cd frontend
    npm install
    cd ..
    ```

    This command installs all the required JavaScript packages for the frontend.

### Running Locally

1.  Start the backend:

    ```sh
    cd backend
    uvicorn main:app --reload
    cd ..
    ```

    This command launches the FastAPI application with automatic reloading for development.
2.  Start the frontend:

    ```sh
    cd frontend
    npm start
    cd ..
    ```

    This command starts the React development server, providing hot-reloading and other development features.

The frontend will be accessible at `http://localhost:3000`, and the backend will be accessible at `http://localhost:8000`.

### Running the Docker Image Locally

1.  Build the Docker image:

    ```sh
    docker build -t verse-pdf-buddy .
    ```

    This command creates a Docker image named `verse-pdf-buddy` using the `Dockerfile` in the current directory.
2.  Run the Docker image:

    ```sh
    docker run -p 8000:8000 verse-pdf-buddy
    ```

    This command runs the Docker image, mapping port 8000 on your host to port 8000 in the container.

The application will be accessible at `http://localhost:8000`.

## Environment Variables

### Frontend Environment Variables

- `REACT_APP_BACKEND_URL`: Specifies the URL of the backend service, allowing the frontend to communicate with the backend.

Example `.env` file:

```
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Backend Environment Variables

- `MISTRAL_API_KEY`: Your unique API key for accessing the Mistral AI OCR service. This key is essential for authenticating with Mistral AI and utilizing its OCR capabilities to extract text from images within your PDFs.
- `GOOGLE_APPLICATION_CREDENTIALS`: The path to your Google Cloud service account key file, enabling secure access to Google Cloud resources. This file provides the necessary credentials for your application to interact with Google Cloud services, such as Gemini for embeddings and Google Cloud Storage.
- `GEMINI_API_KEY`: API key for accessing the Google Gemini model.
- `GEMINI_BASE_URL`: Base URL for the Google Gemini API.
- `MONGODB_CONNECTION_STRING`: The connection string used to connect to your MongoDB database.
- `MONGODB_DATABASE`: The name of the MongoDB database where your data will be stored.
- `MONGODB_COLLECTION`: The name of the MongoDB collection where the extracted text and embeddings will be stored.
- `MONGODB_SEARCH_INDEX_NAME`: The name of the search index in MongoDB used for performing semantic searches.
- `MONGODB_VECTOR_EMBEDDING_PATH`: The path where vector embeddings are stored.
- `MONGODB_SEARCH_TOP_K`: The number of top results to return from a semantic search.
- `EMBEDDING_MODEL`: Specifies the embedding model to be used for generating vector embeddings.

Example `.env` file:

```
MISTRAL_API_KEY=your_mistral_api_key
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/google/credentials.json
GEMINI_API_KEY=your_gemini_api_key
GEMINI_BASE_URL=your_gemini_base_url
MONGODB_CONNECTION_STRING=mongodb://user:password@host:port/database
MONGODB_DATABASE=your_database_name
MONGODB_COLLECTION=your_collection_name
MONGODB_SEARCH_INDEX_NAME=your_search_index_name
MONGODB_VECTOR_EMBEDDING_PATH=/path/to/vector/embeddings
MONGODB_SEARCH_TOP_K=10
EMBEDDING_MODEL=your_embedding_model
```

## Debugging

### Backend

Leverage any Python debugger with FastAPI for efficient debugging. Tools like `pdb` or IDE-integrated debuggers (VSCode, PyCharm) are highly recommended.

### Frontend

Utilize the browser's built-in developer tools to inspect and debug the React frontend. The React Developer Tools browser extension can further enhance your debugging experience.

## Contributing

We enthusiastically welcome contributions to Verse PDF Buddy! Join us in making this project even better. To contribute:

1.  Fork the repository to your own GitHub account.
2.  Create a new branch dedicated to your feature or bug fix.
3.  Implement your changes, ensuring clear and descriptive commit messages.
4.  Submit a pull request, outlining the changes you've made and their benefits.

## Upcoming Updates

- Improved error handling for a more robust application.
- Enhanced search functionality for more accurate and relevant results.
- Support for a wider range of file types, expanding the application's versatility.
- User authentication for secure access and personalized experiences.

Thank you for choosing Verse PDF Buddy! We're excited to see how you'll use it to unlock the power of your PDF documents.
