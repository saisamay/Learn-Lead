# Design Document: Learn & Lead Platform

## Executive Summary

Learn & Lead is an AWS-native, AI-powered learning platform that teaches students how to think — not what to copy.

Instead of generating answers, our system uses adaptive AI reasoning to scaffold problem-solving through progressive hints, contextual code analysis, and Socratic questioning. The platform analyzes a student's code in real time and adjusts guidance based on their struggle patterns — ensuring learning integrity while accelerating understanding.

Built entirely on AWS serverless architecture (S3, CloudFront, Lambda, Bedrock), the system is secure, scalable, and cost-efficient — delivering intelligent mentorship without exposing credentials or compromising performance.

**Core Innovation**: An AI-driven reasoning scaffold that dynamically adapts to how a student thinks — not just what they ask.

**MVP Scope**: Hackathon demonstration focusing on Learning Mode with optional Interview Mode
**Target Users**: Undergraduate engineering students and early-stage developers

## Problem Statement

Engineering students today are surrounded by answers — but rarely guided through thinking.

Autocomplete tools generate solutions instantly. Chatbots provide complete code when asked. Tutorial platforms follow rigid, one-size-fits-all paths. While these tools increase speed, they often bypass the most important part of learning: reasoning.

**As a result**:
- Students solve problems without understanding them
- Confidence becomes dependent on AI assistance
- The gap between "copying code" and "thinking like an engineer" continues to grow

The real problem isn't access to information — it's the absence of adaptive mentorship.

Students don't just need solutions. They need structured guidance that adapts to their struggle patterns, reinforces conceptual clarity, and teaches them how to approach problems independently.

**Learn & Lead addresses this gap** by using AI not as an answer generator, but as a reasoning partner — one that scaffolds learning, enforces progressive hints, and strengthens problem-solving habits instead of replacing them.

## Why AI is Essential (Not Optional)

### The Problem with Existing Solutions

**Static Tutorial Platforms** (Codecademy, freeCodeCamp):
- Fixed content paths
- No adaptation to individual struggle patterns
- Cannot understand student's reasoning process
- Provide answers, not thinking frameworks

**Code Autocomplete Tools** (GitHub Copilot, Tabnine):
- Generate solutions directly
- Skip the learning process entirely
- No pedagogical scaffolding
- Encourage copy-paste without understanding

**Generic Chatbots** (ChatGPT, Claude):
- Provide complete solutions when asked
- No progressive hint system
- Cannot enforce learning-first approach
- No context of student's current code state

### Learn & Lead's AI Approach

**Adaptive Reasoning Scaffolds**:
1. **Contextual Code Analysis**: AI understands what the student is trying to accomplish and where they're stuck
2. **Progressive Hint System**: Three-level scaffolding (conceptual → approach → specific) that never provides complete solutions
3. **Socratic Questioning**: AI asks probing questions that guide discovery rather than providing answers
4. **Struggle Pattern Detection**: AI identifies when a student needs more or less scaffolding based on conversation history

**Example Interaction**:
```
Student: "How do I reverse a string in Python?"

❌ Generic Chatbot: "Use string[::-1] or ''.join(reversed(string))"

✅ Learn & Lead AI:
Level 1 (Conceptual): "What built-in Python methods work with strings? 
                       Think about how you might access characters in reverse order."

[If still stuck]
Level 2 (Approach): "Consider using string slicing. Python allows negative indices. 
                     What happens when you use [::-1]?"

[If still stuck]
Level 3 (Specific): "Try: result = my_string[::-1]. The -1 step means 'go backwards'. 
                     Now explain why this works."
```

**Why This Requires AI**:
- **Dynamic Context**: Must analyze arbitrary student code and understand intent
- **Adaptive Scaffolding**: Must adjust hint specificity based on real-time responses
- **Natural Language Reasoning**: Must generate contextually relevant explanations
- **Pattern Recognition**: Must identify when student is stuck vs. making progress

**This cannot be achieved with**:
- Rule-based systems (cannot handle arbitrary code)
- Templates (cannot adapt to individual patterns)
- Static content (cannot provide contextual guidance)

## AWS Architecture (Hackathon-Optimized)

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        AWS Cloud                              │
│                                                               │
│  CloudFront CDN → S3 Static Hosting (Frontend)               │
│         ↓                                                     │
│  API Gateway (HTTPS, CORS, Throttling)                       │
│         ↓                                                     │
│  Lambda Functions (AI Orchestration)                         │
│         ↓                                                     │
│  AWS Bedrock (Claude 3 Sonnet) ← IAM Role (No API Keys)     │
│                                                               │
│  CloudWatch Logs (Monitoring)                                │
└──────────────────────────────────────────────────────────────┘

Client-Side: Pyodide (Python), Web Speech API, face-api.js (optional)
```

### Service Selection Rationale

**Frontend: S3 + CloudFront**
- **Why**: Static SPA requires no server, scales infinitely, costs ~$0.10 for hackathon
- **vs EC2**: No server management, no idle costs, automatic global distribution
- **Security**: HTTPS by default, DDoS protection via AWS Shield

**Backend: AWS Lambda**
- **Why**: Pay-per-invocation ($0.20 per 1M requests), auto-scales 0→1000 concurrent
- **vs EC2**: Zero idle cost, no server management, faster deployment
- **Trade-off**: 1-2s cold start acceptable for hackathon demo

**AI: AWS Bedrock (Claude 3 Sonnet)**
- **Why**: IAM role-based access (no API keys), same-region latency, AWS-native
- **vs OpenAI API**: No exposed credentials, traffic stays in AWS, simpler security model
- **Cost**: $3 per 1M input tokens (~$0.50 for hackathon weekend)
- **Fallback**: OpenAI API if Bedrock unavailable in region

**API Gateway**
- **Why**: Managed HTTPS endpoint, built-in throttling, CORS handling
- **Security**: Rate limiting (100 req/sec), request validation, no exposed backend

**Monitoring: CloudWatch**
- **Why**: Automatic Lambda logging, custom metrics, cost alarms
- **MVP Scope**: Basic logs + error tracking (no complex dashboards)

### Security Architecture

**IAM-Based AI Access** (No Exposed API Keys):
```typescript
// Lambda execution role has Bedrock permissions
// No API keys in code, environment variables, or frontend
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION
  // Uses Lambda execution role credentials automatically
});
```

**Why This Matters**:
- Frontend never sees AI credentials
- API keys cannot be extracted from browser
- IAM policies enforce least-privilege access
- CloudTrail logs all AI invocations for audit

**Request Flow**:
```
Frontend → API Gateway (validates request)
         → Lambda (sanitizes input)
         → Bedrock (IAM role auth)
         → Lambda (validates response)
         → Frontend (safe output)
```

### Scalability

**Current MVP Capacity**:
- Frontend: Unlimited (CloudFront auto-scales)
- Backend: 10 concurrent Lambda = ~100 users/minute
- Cost: ~$1-2 for hackathon weekend

**Production Scaling** (no code changes needed):
- Increase Lambda concurrency: 10 → 1000
- Add ElastiCache for response caching
- Enable Lambda SnapStart for faster cold starts
- Estimated cost: ~$70/month for 10,000 users

### Cost Breakdown (Hackathon Weekend)

| Service | Usage | Cost |
|---------|-------|------|
| S3 + CloudFront | 100 MB + 1 GB transfer | $0.09 |
| API Gateway | 10,000 requests | $0.04 |
| Lambda | 10,000 invocations @ 5s | $0.08 |
| Bedrock | 100,000 tokens | $0.45 |
| CloudWatch | 1 GB logs | $0.50 |
| **Total** | | **~$1.16** |

## UI Architecture

### Core Layout (2D - Required)

**Learning Mode** (Two-Panel):
```
┌─────────────────────────────────────────────┐
│  Header: Logo | Mode Toggle | Session Info  │
├──────────────────┬──────────────────────────┤
│  Code Editor     │  AI Guidance Panel       │
│  (Monaco)        │  - Progressive hints     │
│  - Run button    │  - Chat interface        │
│  - Output        │  - Progress tracker      │
└──────────────────┴──────────────────────────┘
```

**Interview Mode** (Single-Panel):
```
┌─────────────────────────────────────────────┐
│  Header: Question | Timer | Back            │
├──────────────────┬──────────────────────────┤
│  Camera Feed     │  Transcript Display      │
│  (Optional)      │  - Real-time text        │
│                  │  - Filler word detection │
└──────────────────┴──────────────────────────┘
```

**Technology Stack**:
- React 18 + TypeScript
- Tailwind CSS (rapid styling)
- Monaco Editor (VS Code engine)
- Vite (fast builds, optimized for S3)

### Optional 3D Presentation Layer

**Purpose**: Visual enhancement for landing page only (not core functionality)

**Constraints**:
- ✅ Lazy-loaded (does not block main app)
- ✅ Fallback to 2D if WebGL unavailable
- ✅ Total 3D assets < 500KB
- ✅ No server-side rendering
- ✅ S3-compatible static files

**Use Cases** (Optional):
1. Landing page hero animation
2. Mode transition effects
3. Milestone celebration particles

**Technology**: Three.js (client-side only)

**Implementation**:
```typescript
// Feature detection + lazy loading
const supports3D = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl'));
  } catch { return false; }
};

// Conditional rendering
{supports3D() ? (
  <Suspense fallback={<Static2D />}>
    <Landing3D />
  </Suspense>
) : (
  <Static2D />
)}
```

**Performance Trade-offs**:
- **Benefit**: Enhanced visual appeal for judges
- **Cost**: +500KB bundle size, +100ms initial load
- **Risk**: Low (graceful fallback to 2D)
- **Decision**: Optional for MVP, can be disabled if time-constrained

## AI Integration Strategy

### Provider Architecture

**Primary: AWS Bedrock (Claude 3 Sonnet)**
```typescript
interface AIProvider {
  chat(request: ChatRequest): Promise<ChatResponse>;
  analyzeCode(code: string): Promise<CodeAnalysis>;
  generateFeedback(transcript: string): Promise<InterviewFeedback>;
}

class BedrockProvider implements AIProvider {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        system: LEARNING_MATE_SYSTEM_PROMPT,
        messages: request.messages
      })
    });
    
    const response = await bedrockClient.send(command);
    return parseBedrockResponse(response);
  }
}
```

**Fallback: OpenAI API** (if Bedrock unavailable):
```typescript
async function getAIProvider(): Promise<AIProvider> {
  if (await isBedrockAvailable()) {
    return new BedrockProvider(); // IAM role auth
  }
  
  // Fallback to OpenAI (requires Secrets Manager)
  const apiKey = await getSecret('openai-api-key');
  return new OpenAIProvider(apiKey);
}
```

### Prompt Engineering (Learning Mode)

**System Prompt**:
```
You are an AI learning mate for engineering students. Your role is to guide thinking, not provide solutions.

RULES:
1. Never provide complete code solutions
2. Use progressive hints: conceptual → approach → specific
3. Ask probing questions that lead to understanding
4. Reference the student's code when providing guidance
5. Detect struggle patterns and adjust scaffolding
6. Be supportive and constructive

CURRENT CONTEXT:
- Student's code: {code}
- Hint level: {hintLevel}
- Previous conversation: {history}

Respond with guidance that helps the student think through the problem.
```

**Response Validation**:
```typescript
function validateAIResponse(response: string): boolean {
  // Ensure AI didn't provide complete solutions
  const codeBlockCount = (response.match(/```/g) || []).length / 2;
  if (codeBlockCount > 1) {
    console.warn('AI provided multiple code blocks');
    return false;
  }
  return true;
}
```

## Interview Mode Architecture

### Scope (MVP)

**Required**:
- ✅ Speech-to-text (Browser Web Speech API)
- ✅ AI-powered communication analysis (filler words, pauses, structure)
- ✅ Interview question bank (5-10 hardcoded questions)
- ✅ Desktop-only (camera/microphone requirements)

**Optional** (can be disabled):
- ⚠️ Emotion detection (face-api.js, client-side)
- ⚠️ Camera feed display

**Future Scope** (not for MVP):
- ❌ AWS Transcribe integration
- ❌ AWS Rekognition for emotion detection
- ❌ Mobile support

### Speech-to-Text Strategy

**MVP: Browser Web Speech API**
- **Why**: Zero cost, instant availability, no backend processing
- **Limitations**: Chrome/Edge only, moderate accuracy
- **Acceptable for**: Hackathon demonstration

**Future: AWS Transcribe**
- **Why**: Higher accuracy, better punctuation
- **Cost**: $0.024/minute (~$1.44/hour)
- **Implementation**: Stream audio → Lambda → S3 → Transcribe

### Emotion Detection Strategy

**MVP: face-api.js (Optional)**
- **Why**: Client-side, zero cost, privacy-friendly
- **Limitations**: Requires good lighting, moderate accuracy
- **Risk**: Can be disabled if unreliable

**Future: AWS Rekognition**
- **Why**: Professional-grade accuracy
- **Cost**: $0.001/image (~$0.60 for 10-min interview)
- **Implementation**: Capture frames → Lambda → Rekognition

### Desktop-Only Constraint

**Justification**:
- Camera/microphone permissions more reliable on desktop
- Larger screen needed for code editor + AI guidance
- Interview practice typically done at desk
- Reduces testing complexity for hackathon

**Implementation**:
```typescript
// Detect mobile and show warning
if (/Mobile|Android|iPhone/i.test(navigator.userAgent)) {
  return <MobileWarning message="Interview Mode requires desktop browser" />;
}
```

## Components and Interfaces

### 1. Code Editor Component

```typescript
interface CodeEditor {
  language: 'python' | 'javascript';
  code: string;
  output: string;
  
  executeCode(): Promise<ExecutionResult>;
  getCode(): string;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}
```

**Implementation**: Monaco Editor + Pyodide (Python) + eval (JavaScript)

### 2. AI Mate Component

```typescript
interface AIMate {
  conversationHistory: Message[];
  currentHintLevel: number;
  
  askQuestion(question: string, code: string): Promise<AIResponse>;
  requestHint(problem: string): Promise<HintResponse>;
  analyzeCode(code: string): Promise<CodeAnalysis>;
}

interface HintResponse {
  hint: string;
  level: 1 | 2 | 3; // conceptual | approach | specific
  encouragement: string;
}
```

### 3. Progressive Hint System

**State Machine**:
```
Level 1 (Conceptual) → Level 2 (Approach) → Level 3 (Specific)
```

**Example**:
- Level 1: "What data structure would be most efficient here?"
- Level 2: "Consider using a loop to iterate through the items"
- Level 3: "Try using a for loop: `for item in items:`"

### 4. Interview Session Orchestrator

```typescript
interface InterviewSession {
  question: InterviewQuestion;
  transcript: string;
  emotionData?: EmotionFrame[]; // Optional
  
  startRecording(): Promise<void>;
  stopRecording(): Promise<InterviewFeedback>;
}

interface InterviewFeedback {
  communicationAnalysis: {
    fillerWords: { word: string; count: number }[];
    pauseCount: number;
    clarity: number; // 0-100
    structure: string;
  };
  emotionAnalysis?: { // Optional
    averageConfidence: number;
    engagementLevel: number;
  };
  suggestions: string[];
}
```

## Deployment Strategy

### Infrastructure as Code (AWS SAM)

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  # API Gateway
  LearnAndLeadAPI:
    Type: AWS::Serverless::Api
    Properties:
      StageName: prod
      Cors:
        AllowOrigin: "'*'"
      ThrottleSettings:
        RateLimit: 100
        BurstLimit: 200

  # Lambda: AI Chat Handler
  ChatFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: handlers/chat.handler
      Runtime: nodejs18.x
      MemorySize: 1024
      Timeout: 30
      Policies:
        - Statement:
            - Effect: Allow
              Action: bedrock:InvokeModel
              Resource: 'arn:aws:bedrock:*::foundation-model/anthropic.claude-3-*'
      Events:
        ChatAPI:
          Type: Api
          Properties:
            RestApiId: !Ref LearnAndLeadAPI
            Path: /api/chat
            Method: POST
```

### Deployment Commands

```bash
# Backend
sam build && sam deploy --guided

# Frontend
npm run build
aws s3 sync dist/ s3://learn-and-lead-frontend
aws cloudfront create-invalidation --distribution-id E123 --paths "/*"
```

### Deployment Timeline (Hackathon)

**Total: ~2 hours**
1. Infrastructure setup (30 min)
2. Frontend deployment (30 min)
3. Configuration (30 min)
4. Testing (30 min)

## Testing Strategy

### Property-Based Testing

**Library**: fast-check (JavaScript/TypeScript)
**Minimum iterations**: 100 runs per property

**Key Properties**:
1. AI never provides complete solutions before hint level 3
2. Hint level progresses monotonically (1 → 2 → 3)
3. Code analysis always produces non-empty results
4. Session data clears completely on logout

**Example**:
```typescript
// Property: AI Never Provides Complete Solutions Prematurely
test('AI responses do not contain complete solutions before hint level 3', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string(), // question
      fc.string(), // code
      fc.integer({ min: 0, max: 2 }), // hint level < 3
      async (question, code, hintLevel) => {
        const response = await aiMate.askQuestion(question, code, hintLevel);
        expect(hasCompleteSolution(response)).toBe(false);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Manual Testing (Demo Day)

**Critical Path**:
1. Load application → displays Learning Mode
2. Enter sample code → AI analyzes correctly
3. Ask question → AI provides hint (not solution)
4. Request more help → hint level increases
5. Switch to Interview Mode → camera activates (if enabled)
6. Answer question → feedback generated

**Performance Requirements**:
- AI responses < 3 seconds
- Code execution < 5 seconds
- No memory leaks during 10-minute session

## Why This Will Impress Judges

### 1. Real AI Reasoning (Not Just API Calls)

**What We're NOT Doing**:
- Wrapping ChatGPT with a UI
- Using AI to generate complete solutions
- Building a chatbot with code syntax highlighting

**What We ARE Doing**:
- Implementing adaptive reasoning scaffolds
- Enforcing progressive hint system via prompt engineering
- Analyzing student code context to provide relevant guidance
- Detecting struggle patterns to adjust scaffolding

**Technical Depth**:
- Custom prompt engineering for pedagogical goals
- Response validation to prevent solution leaks
- Context management across conversation history
- Hint level state machine with adaptive transitions

### 2. Responsible AI Usage

**Ethical Design**:
- AI guides thinking, never provides complete solutions
- Preserves learning integrity (no copy-paste culture)
- Transparent about AI limitations
- Encourages human mentorship for complex issues

**Privacy & Security**:
- No PII stored beyond session
- Code and conversations cleared on logout
- AI models don't train on student data
- Clear privacy notice before first use

### 3. Secure Cloud-Native Implementation

**AWS Best Practices**:
- IAM roles instead of API keys (no credential exposure)
- Serverless architecture (no server management)
- HTTPS everywhere (CloudFront + API Gateway)
- Rate limiting and input validation
- CloudWatch monitoring and cost alarms

**Security Highlights**:
- Frontend never sees AI credentials
- Lambda execution role has least-privilege permissions
- Secrets Manager for fallback API keys
- Request sanitization before AI invocation

### 4. Clear MVP Boundaries

**In Scope (MVP)**:
- Learning Mode with AI guidance (required)
- Progressive hint system (required)
- Code execution (Python/JavaScript)
- Interview Mode with speech-to-text (optional)
- Desktop-only support

**Out of Scope (Future)**:
- User authentication
- Persistent storage
- Mobile support
- Multi-file projects
- AWS Transcribe/Rekognition integration

**Why This Matters**:
- Demonstrates realistic project scoping
- Shows understanding of hackathon constraints
- Proves ability to prioritize features
- Reduces demo risk

### 5. Scalability Path (Without Over-Engineering)

**Current MVP**:
- 10 concurrent Lambda executions
- ~100 users/minute capacity
- ~$1-2 cost for hackathon weekend

**Production Scaling** (no architecture changes):
- Increase Lambda concurrency: 10 → 1000
- Add ElastiCache for response caching
- Enable Lambda SnapStart
- Estimated: ~$70/month for 10,000 users

**Why This Matters**:
- Architecture supports growth without rewrite
- Serverless scales automatically
- Cost scales linearly with usage
- No premature optimization

### 6. Technical Execution Quality

**Code Quality**:
- TypeScript for type safety
- Property-based testing for correctness
- Error boundaries for graceful degradation
- Accessibility compliance (WCAG 2.1 AA target)

**AWS Integration**:
- Infrastructure as Code (AWS SAM)
- CloudWatch monitoring
- Cost budgets and alarms
- Deployment automation

**Demo Reliability**:
- Fallback strategies (3D → 2D, Bedrock → OpenAI)
- Error handling at every layer
- Performance budgets enforced
- Tested critical path

## Conclusion

Learn & Lead demonstrates a technically sound, AWS-native approach to AI-powered education. The architecture prioritizes:

1. **Real AI reasoning** over generic chatbot wrappers
2. **Responsible AI usage** that preserves learning integrity
3. **Secure cloud-native implementation** using AWS best practices
4. **Clear MVP boundaries** appropriate for hackathon scope
5. **Scalability path** without premature optimization

The system is designed to be judge-ready: technically strong, clearly scoped, and demonstrably functional within hackathon constraints.
