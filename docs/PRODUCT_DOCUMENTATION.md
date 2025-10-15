# SentiVibe Product Documentation

This document outlines the features, functionalities, and user experience of the SentiVibe application.

## Core Features

### YouTube Video Analysis
SentiVibe allows users to input a YouTube video URL and receive a comprehensive AI-powered analysis of its audience sentiment. This includes:
- **Overall Sentiment:** A general classification of the audience's feeling (e.g., positive, negative, neutral, mixed).
- **Emotional Tones:** Identification of specific emotions present in the comments (e.g., joy, anger, sadness, surprise).
- **Key Themes:** Extraction of the most discussed topics and subjects within the comments.
- **Summary Insights:** A concise, AI-generated summary of the key findings from the analysis.
- **Custom Q&A:** Users can define specific questions to be answered by the AI based on the video's content and comments.

### Multi-Video Comparison
Users can compare multiple YouTube videos side-by-side to understand differences and similarities in audience sentiment, emotional tones, and key themes. This feature is ideal for competitive analysis, trend identification, or comparing different content strategies.

### AI Chat Interface
Each analysis and comparison comes with an integrated AI chat interface. Users can ask follow-up questions about the analysis results, delve deeper into specific comments, or explore related topics.
- **Adaptive Response Length:** AI responses are dynamically generated with an adaptive length, tailored to the complexity of the query and the selected persona. The AI aims for conciseness by default, expanding only when more detail is explicitly requested.
- **DeepThink Mode (Paid Feature):** Enables the AI to perform more extensive processing for more nuanced and detailed responses. **This feature is available only for Paid Tier users.**
- **DeepSearch Mode (Paid Feature):** Allows the AI to fetch and integrate real-time external context from web searches to provide more comprehensive answers. **This feature is available only for Paid Tier users.**
- **Persona Selection:** Users can choose from various AI personas (e.g., Friendly, Therapist, Storyteller, Motivational Coach, Argumentative) to tailor the interaction style.

### Library Copilot
The Library Copilot assists users in navigating their saved video analyses and comparisons. It can help find specific content based on keywords, creators, or themes, and can also suggest new analysis topics. **Note: DeepThink and DeepSearch modes are available only for Paid Tier users.**

### Guide Assistant
The Guide Assistant is an AI-powered helper available throughout the application to answer questions about SentiVibe's features, how to use them, and troubleshoot common issues. It leverages both product and technical documentation for comprehensive support. **Note: DeepThink and DeepSearch modes are available only for Paid Tier users.**

## User Interface (UI) & Experience (UX)

- **Responsive Design:** SentiVibe is designed to be fully responsive, providing an optimal viewing and interaction experience across various devices, from desktops to mobile phones.
- **Intuitive Navigation:** A clear and consistent navigation structure ensures users can easily find features and information.
- **Dark Mode Support:** The application offers a dark mode option for improved readability and reduced eye strain in low-light environments.
- **Accessibility:** Efforts are made to ensure the application is accessible to users with diverse needs.

## Data Management

- **Secure Storage:** User data, including video analyses and comparisons, is securely stored using Supabase.
- **User Accounts:** Authentication and authorization are managed through Supabase, allowing for secure user logins and data privacy.

## Future Enhancements (Roadmap)

- **Real-time Analysis:** Integration of real-time data streams for live sentiment analysis.
- **Advanced Visualization:** More interactive and customizable data visualizations.
- **Integration with other platforms:** Expanding analysis capabilities beyond YouTube.
- **Team Collaboration Features:** Tools for sharing analyses and collaborating with team members.