// Test script to verify AI API endpoints
// Run this after setting up your API keys

const testAPIs = async () => {
  console.log('🧪 Testing AI API Endpoints...\n');

  const testCases = [
    {
      type: 'aptitude',
      careerGoal: 'software engineer',
      technology: 'JavaScript',
      apiProvider: 'gemini' // This should work with your existing key
    },
    {
      type: 'technical',
      careerGoal: 'data scientist',
      technology: 'Python',
      apiProvider: 'deepseek' // Test DeepSeek V3.1
    },
    {
      type: 'technical_interview',
      careerGoal: 'frontend developer',
      technology: 'React',
      apiProvider: 'gptoss' // Test GPT-OSS-120B
    },
    {
      type: 'hr_interview',
      careerGoal: 'product manager',
      technology: 'Agile',
      apiProvider: 'mistral' // Test Mistral Small 3.2
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Testing ${testCase.type} questions for ${testCase.careerGoal} in ${testCase.technology} using ${testCase.apiProvider}...`);
    
    try {
      const response = await fetch('http://localhost:3000/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success! Generated ${data.questions.length} questions using ${data.apiProvider}`);
        console.log(`   First question: ${data.questions[0].question.substring(0, 60)}...`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🎯 Your system now supports 6 different AI models:');
  console.log('   • Gemini (your existing API)');
  console.log('   • DeepSeek V3.1 (OpenRouter)');
  console.log('   • GPT-OSS-120B (OpenRouter)');
  console.log('   • Mistral Small 3.2 24B (OpenRouter)');
  console.log('   • Llama 4 Maverick (OpenRouter)');
  console.log('   • Qwen3 Coder 48B (OpenRouter)');
  console.log('');
  console.log('🚀 Each practice session will now use different AI models for variety!');
};

// Run the test
testAPIs().catch(console.error);
