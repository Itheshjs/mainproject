# Firebase Studio - Career Compass

This is a NextJS starter application in Firebase Studio designed to help users with their career preparation using AI. It features:

-   **Resume Analysis:** Upload your resume (PDF/DOCX) for AI-powered feedback on strengths, weaknesses, and improvements.
-   **Mock Interviews:** Simulate interviews for various fields and receive AI-driven suggestions.

## Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```
    or
    ```bash
    pnpm install
    ```

2.  **Set up Environment Variables:**
    -   You need a Google AI API key to use the AI features (Gemini model).
    -   Get your key from [Google AI Studio](https://makersuite.google.com/app/apikey).
    -   Rename the `.env.example` file (or create a new `.env` file) in the root directory.
    -   Add your API key to the `.env` file:
        ```env
        GOOGLE_API_KEY=YOUR_API_KEY_HERE
        ```
    -   **Important:** Keep your API key secret. The `.env` file is already included in `.gitignore` to prevent accidental commits.

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    or
    ```bash
    yarn dev
    ```
    or
    ```bash
    pnpm dev
    ```
    This command starts both the Next.js application (usually on port 9002) and the Genkit development server.

4.  **Open the Application:**
    Navigate to [http://localhost:9002](http://localhost:9002) in your browser.

## Project Structure

-   `src/app/`: Contains the Next.js App Router pages and layouts.
    -   `(app)/`: Route group for authenticated application pages (Dashboard, Resume Analysis, Mock Interview, Settings).
    -   `layout.tsx`: Root layout.
    -   `globals.css`: Global styles and Tailwind CSS theme variables.
-   `src/components/`: Reusable UI components, primarily using ShadCN UI.
-   `src/ai/`: Genkit AI integration files.
    -   `genkit.ts`: Genkit configuration and initialization.
    -   `flows/`: Defines the AI flows (e.g., `analyze-resume.ts`, `simulate-interview.ts`).
    -   `dev.ts`: Entry point for the Genkit development server.
-   `src/hooks/`: Custom React hooks (e.g., `use-toast.ts`, `use-mobile.ts`).
-   `src/lib/`: Utility functions (e.g., `utils.ts`).
-   `src/services/`: Functions for interacting with external services or data sources (e.g., `interview-questions.ts`).
-   `public/`: Static assets.
-   `components.json`: ShadCN UI configuration.
-   `next.config.ts`: Next.js configuration.
-   `tailwind.config.ts`: Tailwind CSS configuration.
-   `tsconfig.json`: TypeScript configuration.

## Key Technologies

-   **Next.js:** React framework with App Router.
-   **TypeScript:** Strongly typed JavaScript.
-   **Tailwind CSS:** Utility-first CSS framework.
-   **ShadCN UI:** Reusable UI components built with Radix UI and Tailwind CSS.
-   **Genkit (Firebase):** AI framework for building and deploying AI flows, using Google's Gemini model.
-   **Lucide React:** Icon library.
-   **React Hook Form:** Form management.
-   **Zod:** Schema validation.
-   **Recharts:** Charting library (used in Resume Analysis).

Explore the code starting from `src/app/(app)/dashboard/page.tsx` to see how the different features are implemented.
