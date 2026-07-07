export interface AIProvider {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  priority: number;
  selectedModel: string;
  models: string[];
}

export interface AISettings {
  providers: AIProvider[];
  smartRouting: boolean;
}

export type AppMode = 'LEARN' | 'VALIDATE' | 'SIMULATE' | 'INTERVIEW' | 'MENTOR' | 'CHALLENGE';

export interface LearnResponse {
  topic: string;
  analogy: string;
  technical_depth: string;
  animation_script: Array<{ step: number; description: string; }>;
  quiz?: Array<{
    q: string;
    options: string[];
    answer: string;
    explanation: string;
  }>;
}

export interface ValidateResponse {
  score: number;
  nodes_to_highlight: Array<{ id: string; reason: string; }>;
  critique: string;
  recommendations: string[];
  is_scalable: boolean;
}

export interface SimulateResponse {
  predictions: {
    avg_latency_ms: number;
    throughput_rps: number;
    bottleneck_component: string;
    status: string;
  };
  simulation_log: string[];
}

export interface InterviewResponse {
  interviewer_thought: string;
  question: string;
  evaluation_score: number;
  is_finished: boolean;
}

export interface MentorResponse {
  answer: string;
  suggestion?: string;
}

export interface ChallengeResponse {
  title: string;
  description: string;
  constraints: string[];
  hints: string[];
}

export interface Architecture {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  tags: string[];
  design: {
    nodes: any[];
    edges: any[];
  };
  explanations: {
    overall: string;
    components: Record<string, string>;
    detailed?: {
      overview: string;
      functionalRequirements: string[];
      nonFunctionalRequirements: string[];
      capacityEstimation?: {
        dau: string;
        rps: string;
        storage: string;
        bandwidth: string;
        calculations?: string[];
      };
      architectureWalkthrough: string[];
      dataFlow: string[];
      designDecisions: Array<{ question: string; answer: string; }>;
      scalingStrategy: string[];
      failureScenarios: Array<{ scenario: string; recovery: string; }>;
      security: string[];
      realWorldUsage: string;
      interviewPerspective: {
        howToExplain: string;
        followUps: string[];
        commonMistakes: string[];
      };
      keyTakeaways: string[];
      interactiveLinks?: Array<{
        label: string;
        type: 'LESSON' | 'ARCHITECTURE' | 'COMPONENT' | 'INTERVIEW' | 'LAB';
        targetId: string;
      }>;
    };
  };
}

export type ArchitectResponse = LearnResponse | ValidateResponse | SimulateResponse | InterviewResponse | MentorResponse | ChallengeResponse;
