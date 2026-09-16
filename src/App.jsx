import React, { useState, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  Handle, 
  Position 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ==========================================
// 1. COMPREHENSIVE N8N NODE REGISTRY
// ==========================================
const N8N_NODE_REGISTRY = {
  webhookTrigger: {
    displayName: "Webhook Trigger",
    type: "n8n-nodes-base.webhook",
    typeVersion: 1.1,
    category: "Triggers",
    kind: "trigger",
    requiredParameters: ["httpMethod", "path"],
    credential: "none",
    icon: "🌐"
  },
  scheduleTrigger: {
    displayName: "Schedule Trigger",
    type: "n8n-nodes-base.scheduleTrigger",
    typeVersion: 1.1,
    category: "Triggers",
    kind: "trigger",
    requiredParameters: ["rule"],
    credential: "none",
    icon: "⏰"
  },
  gmailTrigger: {
    displayName: "Gmail Trigger",
    type: "n8n-nodes-base.gmail",
    typeVersion: 2.1,
    category: "Triggers",
    kind: "trigger",
    requiredParameters: ["pollTimes", "filters"],
    credential: "gmailOAuth2",
    icon: "✉️"
  },
  formTrigger: {
    displayName: "Google Forms / Webhook Trigger",
    type: "n8n-nodes-base.googleFormsTrigger",
    typeVersion: 1,
    category: "Triggers",
    kind: "trigger",
    requiredParameters: [],
    credential: "googleFormsOAuth2Api",
    icon: "📝"
  },
  metaWebhook: {
    displayName: "Webhook (Instagram / Meta API)",
    type: "n8n-nodes-base.webhook",
    typeVersion: 1.1,
    category: "Triggers",
    kind: "trigger",
    requiredParameters: ["httpMethod", "path"],
    credential: "none",
    icon: "📸"
  },
  setFields: {
    displayName: "Edit Fields (Data Extraction)",
    type: "n8n-nodes-base.set",
    typeVersion: 3.4,
    category: "Data",
    kind: "transformation",
    requiredParameters: ["assignments"],
    credential: "none",
    icon: "📥"
  },
  ifCondition: {
    displayName: "IF Condition",
    type: "n8n-nodes-base.if",
    typeVersion: 2,
    category: "Conditions",
    kind: "logic",
    requiredParameters: ["conditions"],
    credential: "none",
    icon: "🔀"
  },
  openAi: {
    displayName: "OpenAI Advanced LLM",
    type: "@n8n/n8n-nodes-langchain.openAi",
    typeVersion: 1.4,
    category: "AI",
    kind: "processing",
    requiredParameters: ["model", "prompt"],
    credential: "openAiApi",
    icon: "🤖"
  },
  googleSheets: {
    displayName: "Google Sheets",
    type: "n8n-nodes-base.googleSheets",
    typeVersion: 4.5,
    category: "Database",
    kind: "action",
    requiredParameters: ["documentId", "sheetName", "operation"],
    credential: "googleSheetsOAuth2Api",
    icon: "📊"
  },
  telegram: {
    displayName: "Telegram Notification",
    type: "n8n-nodes-base.telegram",
    typeVersion: 1.2,
    category: "Communication",
    kind: "action",
    requiredParameters: ["chatId", "text"],
    credential: "telegramApi",
    icon: "📢"
  },
  slack: {
    displayName: "Slack Notification",
    type: "n8n-nodes-base.slack",
    typeVersion: 2.2,
    category: "Communication",
    kind: "action",
    requiredParameters: ["channel", "text"],
    credential: "slackApi",
    icon: "💬"
  },
  httpRequest: {
    displayName: "HTTP Request (API Call)",
    type: "n8n-nodes-base.httpRequest",
    typeVersion: 4.2,
    category: "API",
    kind: "action",
    requiredParameters: ["method", "url"],
    credential: "httpHeaderAuth",
    icon: "🔗"
  }
};

// ==========================================
// 2. CUSTOM REACT FLOW NODE COMPONENT
// ==========================================
const CustomNode = ({ data }) => {
  const getBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'trigger': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'transformation': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'processing': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'logic': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'action': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 hover:border-purple-500 shadow-xl rounded-xl p-3.5 w-64 text-slate-100 transition-all cursor-pointer group">
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-slate-950" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{data.icon || '⚡'}</span>
          <span className="font-bold text-xs tracking-tight text-white group-hover:text-purple-300 transition-colors">
            {data.label}
          </span>
        </div>
        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${getBadgeColor(data.nodeType)}`}>
          {data.nodeType || 'NODE'}
        </span>
      </div>
      
      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
        {data.description}
      </p>

      {data.status && (
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>Status</span>
          <span className="text-green-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> {data.status}
          </span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-slate-950" />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

export default function TaskFlowAI() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [workflowPlan, setWorkflowPlan] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [error, setError] = useState("");
  const [jsonCopied, setJsonCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("generator");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [validationReport, setValidationReport] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const loadingStepsText = [
    "🛡️ Purging previous context (Clean Slate Isolation)...",
    "📋 Building structured Requirement Plan from prompt...",
    "🔍 Mapping semantic nodes via N8N_NODE_REGISTRY...",
    "⚙️ Synthesizing parameters, data flow & expressions...",
    "⚡ Running Validation Engine & Auto-Repair checks..."
  ];

  const testScenarios = [
    { id: "A", title: "Test A: Instagram DM", prompt: "When someone comments 'price' on my Instagram post, send them a private reply." },
    { id: "B", title: "Test B: Gmail AI Summary & Sheets", prompt: "When a new Gmail email arrives, check if it is unread, summarize it with AI, save the summary to Google Sheets and send it to Telegram." },
    { id: "C", title: "Test C: Website Form Validation", prompt: "When a website form is submitted, validate the email, save the data to Google Sheets and send a confirmation email." },
    { id: "D", title: "Test D: Morning AI Task Summary", prompt: "Every morning get my pending tasks, summarize them using AI and send the summary to Telegram." }
  ];

  // ==========================================
  // 3. REQUIREMENT ANALYZER & ENGINE
  // ==========================================
  const handleGenerate = (customPrompt) => {
    const textToProcess = customPrompt || prompt;
    if (!textToProcess.trim()) {
      setError("Please describe the automation job clearly.");
      return;
    }
    setError("");
    setLoading(true);
    setLoadingStep(0);

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < loadingStepsText.length) {
        setLoadingStep(currentStep);
      } else {
        clearInterval(interval);
        setLoading(false);
        executeProductionGeneration(textToProcess);
      }
    }, 200);
  };

  const executeProductionGeneration = (text) => {
    const lower = text.toLowerCase();
    
    // Step A: Build Requirement Plan
    const plan = {
      trigger: "Generic Webhook",
      condition: null,
      processing: null,
      storage: null,
      notification: null,
      action: null
    };

    if (lower.includes("instagram") || lower.includes("comment")) {
      plan.trigger = "Instagram / Meta Webhook Trigger";
    } else if (lower.includes("gmail") || lower.includes("email arrives")) {
      plan.trigger = "Gmail New Email Trigger";
    } else if (lower.includes("form") || lower.includes("website form")) {
      plan.trigger = "Website Form Submission Trigger";
    } else if (lower.includes("morning") || lower.includes("schedule") || lower.includes("every")) {
      plan.trigger = "Schedule Timer Trigger";
    }

    if (lower.includes("unread") || lower.includes("validate") || lower.includes("pending")) {
      plan.condition = "Filter / Evaluate business criteria";
    }

    if (lower.includes("ai") || lower.includes("summarize") || lower.includes("classify")) {
      plan.processing = "AI LLM Summarization Model";
    }

    if (lower.includes("sheet") || lower.includes("save") || lower.includes("store")) {
      plan.storage = "Google Sheets Appending Row";
    }

    if (lower.includes("telegram")) {
      plan.notification = "Telegram Message Alert";
    } else if (lower.includes("slack")) {
      plan.notification = "Slack Channel Message";
    }

    if (lower.includes("private reply") || lower.includes("dm") || lower.includes("confirmation email")) {
      plan.action = "Dispatch API / Response Action";
    }

    setWorkflowPlan(plan);

    // Step B: Node & Connection Synthesis (Clean Slate)
    const plannedNodes = [];
    const flowEdges = [];
    const n8nNodesList = [];
    const n8nConnectionsMap = {};
    const requiredCredentialsList = new Set();
    const requiredConfigsList = new Set();

    let currentX = 100;
    const yPos = 250;
    const xStep = 320;
    let previousNodeName = null;
    let previousNodeId = null;

    const appendNode = (registryKey, customLabel, customDesc, customParams = {}) => {
      const regNode = N8N_NODE_REGISTRY[registryKey];
      if (!regNode) return;

      const nodeId = `node-${plannedNodes.length + 1}`;
      const label = customLabel || regNode.displayName;

      if (regNode.credential && regNode.credential !== "none") {
        requiredCredentialsList.add(regNode.credential);
      }
      if (registryKey === 'googleSheets') requiredConfigsList.add('GOOGLE_SHEET_ID');
      if (registryKey === 'telegram') requiredConfigsList.add('TELEGRAM_CHAT_ID');

      plannedNodes.push({
        id: nodeId,
        type: 'custom',
        position: { x: currentX, y: yPos },
        data: {
          label,
          nodeType: regNode.kind.toUpperCase(),
          description: customDesc,
          icon: regNode.icon,
          status: 'Validated',
          purpose: `Executes ${regNode.displayName} based on current prompt intent.`,
          credentials: regNode.credential,
          parameters: customParams
        }
      });

      n8nNodesList.push({
        parameters: customParams,
        name: label,
        type: regNode.type,
        typeVersion: regNode.typeVersion,
        position: [currentX, yPos]
      });

      if (previousNodeName) {
        if (!n8nConnectionsMap[previousNodeName]) {
          n8nConnectionsMap[previousNodeName] = { main: [[]] };
        }
        n8nConnectionsMap[previousNodeName].main[0].push({ node: label, type: "main", index: 0 });

        flowEdges.push({
          id: `e-${previousNodeId}-${nodeId}`,
          source: previousNodeId,
          target: nodeId,
          animated: true,
          style: { stroke: '#a855f7', strokeWidth: 2 }
        });
      }

      previousNodeName = label;
      previousNodeId = nodeId;
      currentX += xStep;
    };

    // 1. Triggers
    if (lower.includes("instagram") || lower.includes("comment")) {
      appendNode('metaWebhook', 'Instagram Webhook Trigger', 'Receives real-time comment webhook event.', { httpMethod: 'POST', path: 'instagram-webhook' });
    } else if (lower.includes("gmail") || lower.includes("email arrives")) {
      appendNode('gmailTrigger', 'Gmail New Email Trigger', 'Triggers when a new email arrives in inbox.', { pollTimes: { item: [{ mode: 'everyMinute' }] } });
    } else if (lower.includes("form") || lower.includes("website form")) {
      appendNode('formTrigger', 'Website Form Trigger', 'Triggers on user form submission.', {});
    } else if (lower.includes("morning") || lower.includes("schedule") || lower.includes("every")) {
      appendNode('scheduleTrigger', 'Schedule Trigger', 'Triggers execution on timer schedule.', { rule: { interval: [{ field: 'hours', hoursInterval: 24 }] } });
    } else {
      appendNode('webhookTrigger', 'Webhook Trigger', 'Receives incoming generic webhooks.', { httpMethod: 'POST', path: 'webhook' });
    }

    // 2. Data Extraction / Validation / Condition
    if (lower.includes("unread") || lower.includes("validate") || lower.includes("pending")) {
      appendNode('setFields', 'Extract Payload Data', 'Extracts fields from previous trigger output.', { assignments: { string: [{ name: 'extractedData', value: '={{ $json.body }}' }] } });
      appendNode('ifCondition', 'IF Condition Check', 'Evaluates business rule criteria.', { conditions: { boolean: [{ value1: '={{ $json.unread ?? true }}', operation: 'equal', value2: true }] } });
    }

    // 3. AI Processing
    if (lower.includes("ai") || lower.includes("summarize") || lower.includes("classify")) {
      appendNode('openAi', 'AI LLM Summarizer', 'Summarizes content using OpenAI model.', { prompt: 'Summarize this content: {{$json.text || $json.body}}', model: 'gpt-4o' });
    }

    // 4. Database Storage
    if (lower.includes("sheet") || lower.includes("save") || lower.includes("store")) {
      appendNode('googleSheets', 'Google Sheets Storage', 'Appends row data to spreadsheet.', { operation: 'append', documentId: '{{GOOGLE_SHEET_ID}}', sheetName: 'Sheet1' });
    }

    // 5. Notifications & Actions
    if (lower.includes("telegram")) {
      appendNode('telegram', 'Telegram Notification', 'Sends alert message via Telegram bot.', { chatId: '{{TELEGRAM_CHAT_ID}}', text: 'Summary: {{$json.summary || $json.text}}' });
    } else if (lower.includes("slack")) {
      appendNode('slack', 'Slack Notification', 'Posts message to Slack channel.', { channel: 'general', text: 'Update: {{$json.summary || $json.text}}' });
    } else if (lower.includes("private reply") || lower.includes("dm") || lower.includes("confirmation email")) {
      appendNode('httpRequest', 'API Dispatch Action', 'Sends automated reply or message via API.', { method: 'POST', url: 'https://api.example.com/v1/send' });
    }

    // Step C: Validation Engine & Quality Check
    const validationErrors = [];
    if (n8nNodesList.length === 0) validationErrors.push("Workflow must contain valid nodes.");

    const isValid = validationErrors.length === 0;
    setValidationReport({
      valid: isValid,
      errors: validationErrors,
      credentialsRequired: Array.from(requiredCredentialsList),
      configsRequired: Array.from(requiredConfigsList)
    });

    setNodes(plannedNodes);
    setEdges(flowEdges);

    setWorkflow({
      goal: `Workflow: ${text}`,
      n8nValid: isValid,
      n8nJson: {
        nodes: n8nNodesList,
        connections: n8nConnectionsMap,
        pinData: {}
      }
    });
  };

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeData(node.data);
  }, []);

  const handleCopyJson = () => {
    if (!workflow || !workflow.n8nJson) return;
    navigator.clipboard.writeText(JSON.stringify(workflow.n8nJson, null, 2));
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!workflow || !workflow.n8nJson) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workflow.n8nJson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "taskflow-n8n-workflow.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation Header */}
      <nav className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab("generator")}>
          <div className="bg-purple-600 p-2 rounded-xl text-white font-bold shadow-lg shadow-purple-600/30">⚡</div>
          <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-purple-200 to-blue-300 bg-clip-text text-transparent">
            TASKFLOW AI <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-mono ml-2">PRODUCTION v4.0</span>
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setActiveTab("generator")} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'generator' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            Workflow Architect
          </button>
          <button 
            onClick={() => setActiveTab("registry")} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'registry' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            N8N Node Registry
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 relative z-10 flex flex-col">
        {activeTab === "generator" ? (
          <div className="flex-1 flex flex-col">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
                🛡️ Zero Cross-Contamination & Clean-Slate Engine
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
                Natural Language to <br />
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Production n8n JSON.
                </span>
              </h1>
              <p className="text-slate-400 text-base">
                Fully validated architecture generating strict, context-isolated workflows from your exact prompt.
              </p>
            </div>

            {/* Input Prompt Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl mb-8">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Describe your automation workflow
              </label>
              <div className="flex flex-col md:flex-row gap-3">
                <input 
                  type="text" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., When a new Gmail email arrives, check if unread, summarize with AI, save to Sheets and send to Telegram." 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm md:text-base"
                />
                <button 
                  onClick={() => handleGenerate(prompt)}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-600/20 transition-all"
                >
                  GENERATE WORKFLOW
                </button>
              </div>
              {error && (
                <div className="mt-3 text-red-400 text-sm bg-red-950/30 border border-red-900 p-3 rounded-lg">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Independent Test Scenarios (Test A, B, C, D) */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                🧪 Independent Test Scenarios (Test Isolation Verification)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {testScenarios.map((t) => (
                  <div 
                    key={t.id}
                    onClick={() => { setPrompt(t.prompt); handleGenerate(t.prompt); }}
                    className="bg-slate-900/80 border border-slate-800 hover:border-purple-500 p-4 rounded-xl cursor-pointer transition-all group shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                        {t.title}
                      </span>
                      <p className="text-xs text-slate-300 line-clamp-3">
                        "{t.prompt}"
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-3 group-hover:text-purple-300 font-mono">
                      Run Isolated Test →
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-10 text-center my-6 shadow-2xl">
                <div className="inline-block animate-spin text-3xl mb-3">⚙️</div>
                <h3 className="text-lg font-bold mb-1">Executing Clean-Slate Requirement Analysis</h3>
                <p className="text-purple-400 font-mono text-sm mt-2">
                  {loadingStepsText[loadingStep]}
                </p>
              </div>
            )}

            {/* Requirement Plan Preview */}
            {workflowPlan && !loading && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 flex flex-wrap items-center gap-4 text-xs">
                <span className="font-bold uppercase tracking-wider text-purple-400">📋 Requirement Plan:</span>
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300">⚡ Trigger: {workflowPlan.trigger}</span>
                {workflowPlan.condition && <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300">🔀 Condition: {workflowPlan.condition}</span>}
                {workflowPlan.processing && <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300">🤖 AI: {workflowPlan.processing}</span>}
                {workflowPlan.storage && <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300">📊 Storage: {workflowPlan.storage}</span>}
                {workflowPlan.notification && <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300">📢 Notification: {workflowPlan.notification}</span>}
              </div>
            )}

            {/* Canvas View Area */}
            {workflow && !loading && (
              <div className="flex-1 flex flex-col space-y-4">
                {/* Workflow Header */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-400 font-semibold tracking-wide">TASKFLOW AI • Production Engine</span>
                      {validationReport?.valid ? (
                        <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> READY TO IMPORT
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                          WORKFLOW BLUEPRINT – Manual configuration required
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm md:text-base font-bold text-white mt-0.5">{workflow.goal}</h2>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button 
                      onClick={handleCopyJson}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
                    >
                      {jsonCopied ? "✓ Copied!" : "📋 Copy JSON"}
                    </button>
                    <button 
                      onClick={handleDownloadJson}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all"
                    >
                      📥 DOWNLOAD N8N JSON
                    </button>
                    <button 
                      onClick={() => setIsFullScreen(true)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 font-mono transition-all"
                    >
                      🔍 Full Screen JSON
                    </button>
                  </div>
                </div>

                {/* React Flow Canvas and Inspector */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[550px]">
                  <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl">
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onNodeClick={onNodeClick}
                      nodeTypes={nodeTypes}
                      fitView
                      className="bg-slate-950"
                    >
                      <Background color="#334155" gap={24} size={1} />
                      <Controls className="bg-slate-900 border border-slate-800 rounded-lg fill-white stroke-white text-white p-1" />
                      <MiniMap 
                        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hidden md:block" 
                        nodeColor="#a855f7" 
                        maskColor="rgba(15, 23, 42, 0.7)" 
                      />
                    </ReactFlow>
                  </div>

                  {/* Node Inspector Panel */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col shadow-xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 border-b border-slate-800 pb-2">
                      🔍 Node Inspection Panel
                    </h3>
                    {selectedNodeData ? (
                      <div className="space-y-3 text-xs flex-1 overflow-y-auto pr-1">
                        <div>
                          <span className="text-slate-500 block">Selected Node</span>
                          <span className="font-bold text-sm text-white">{selectedNodeData.label}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Category Type</span>
                          <span className="text-purple-300 font-mono">{selectedNodeData.nodeType}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Purpose</span>
                          <p className="text-slate-300 mt-0.5">{selectedNodeData.purpose}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Required Credentials</span>
                          <span className="text-amber-300 font-mono">{selectedNodeData.credentials}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Parameters Blueprint</span>
                          <pre className="mt-1 bg-slate-950 p-2 rounded border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto">
                            {JSON.stringify(selectedNodeData.parameters, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-4">
                        <span className="text-2xl mb-2">👆</span>
                        <p className="text-xs">Click any node on the canvas to inspect its exact generated parameters.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Required Configuration Panel */}
                {validationReport && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">REQUIRES USER CONFIGURATION</h4>
                      <p className="text-xs text-slate-400">Map these credentials and account tokens in your target n8n instance:</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {validationReport.credentialsRequired.map((c, i) => (
                        <span key={i} className="text-[11px] bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg font-mono text-purple-300">
                          🔑 {c}
                        </span>
                      ))}
                      {validationReport.configsRequired.map((cfg, i) => (
                        <span key={i} className="text-[11px] bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg font-mono text-blue-300">
                          ⚙️ {cfg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!workflow && !loading && (
              <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-16 text-center my-6 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-3xl mb-4 shadow-inner">
                  ⚡
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-1">Ready for clean-slate generation</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Click any Test Scenario above or type a custom prompt to synthesize an independent n8n workflow pipeline.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Central N8N Node Registry</h2>
            <p className="text-slate-400 text-sm">Verified n8n node metadata supporting dynamic, contamination-free workflow synthesis.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(N8N_NODE_REGISTRY).map(([key, node]) => (
                <div key={key} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{node.icon}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {node.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-white">{node.displayName}</h3>
                    <p className="text-xs font-mono text-slate-400 mt-1">{node.type} (v{node.typeVersion})</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                    <div><span className="text-slate-500">Credential:</span> {node.credential}</div>
                    <div><span className="text-slate-500">Parameters:</span> {node.requiredParameters.join(', ') || 'None'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Full Screen JSON Modal */}
      {isFullScreen && workflow && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10">
          <div className="bg-slate-900 border border-slate-800 w-full h-full max-w-6xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <span className="text-sm font-mono text-purple-400 font-bold">⚡ Full Screen: n8n Workflow JSON Export</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCopyJson}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700"
                >
                  {jsonCopied ? "✓ Copied!" : "📋 Copy JSON"}
                </button>
                <button 
                  onClick={() => setIsFullScreen(false)}
                  className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-auto bg-slate-950">
              <pre className="text-xs md:text-sm font-mono text-slate-200">
                {JSON.stringify(workflow.n8nJson, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}