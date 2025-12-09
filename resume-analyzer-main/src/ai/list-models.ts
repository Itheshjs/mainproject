import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.error('GOOGLE_API_KEY not found in environment variables');
    return;
  }
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Available models:');
      data.models.forEach((model: any) => {
        console.log(`- ${model.name}`);
      });
    } else {
      console.error('Error fetching models:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();