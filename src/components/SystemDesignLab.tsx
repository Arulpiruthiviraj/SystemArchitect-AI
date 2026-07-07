import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  Panel,
  ReactFlowProvider,
  MiniMap,
  BaseEdge,
  getBezierPath,
  EdgeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import CustomNode from './CustomNode';
import ComponentHoverCard from './ComponentHoverCard';
import InterviewPanel from './InterviewPanel';
import DocumentationPanel from './DocumentationPanel';
import { Activity, Download, Upload, Trash2, CheckSquare, Play, Pause, Square, ChevronUp, ChevronDown, Search, X, Info, Layers, Edit3, Send, RotateCcw, Skull, TrendingDown, Hash, BookOpen, AlertTriangle, Target, Map as MapIcon, Menu, Code, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { loadSettings } from './Settings';
import Markdown from 'react-markdown';
import { COMPONENT_CATALOG, COMPONENT_CATEGORIES, ComponentDefinition } from '../data/components';
import { Architecture } from '../types';
import SimulationPlayground from './SimulationPlayground';
import ShardingPlayground from './ShardingPlayground';
import KafkaPlayground from './KafkaPlayground';
import CachePlayground from './CachePlayground';
import FailurePlayground from './FailurePlayground';
import InteractiveSystemLabs from './InteractiveSystemLabs';
import RequirementsScratchpad from './labs/RequirementsScratchpad';
import { 
  Globe, Smartphone, Laptop, Route, Shield, Database, HardDrive, 
  Server, Cpu, Box, Cloud, Lock, Mail, MessageSquare, Brain, 
  Key, FileText, Network, Wifi, CloudRain, ShieldAlert,
  StretchHorizontal, Archive, Skull as SkullIcon, RotateCcw as RotateIcon, Fingerprint, Wind
} from 'lucide-react';

const ICONS: Record<string, any> = {
  Globe, Smartphone, Laptop, Route, Shield, Search, Database, HardDrive,
  Server, Cpu, Box, Cloud, Activity, Lock, Mail, MessageSquare, Brain,
  Key, FileText, Layers, Network, Wifi, CloudRain, ShieldAlert,
  StretchHorizontal, Archive, Skull: SkullIcon, RotateCcw: RotateIcon, Fingerprint, Wind
};

const nodeTypes = {
  custom: CustomNode,
};

const PacketEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const intensity = data?.intensity || 0; // 0 to 5
  const isAnimating = data?.isAnimating || intensity > 0;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: isAnimating ? 2 : 1, stroke: isAnimating ? '#6366f1' : '#3f3f46' }} />
      {isAnimating && Array.from({ length: Math.max(1, intensity) }).map((_, i) => {
        const count = Math.max(1, intensity);
        const duration = 2 / count; // Faster if more packets
        const begin = `-${duration * (i / count)}s`;
        return (
          <circle key={i} r={intensity > 3 ? "3" : "4"} fill="#818cf8" filter="drop-shadow(0 0 5px #818cf8)">
            <animateMotion dur={`${Math.max(0.5, duration)}s`} begin={begin} repeatCount="indefinite" path={edgePath} />
          </circle>
        );
      })}
    </>
  );
};

const edgeTypes = {
  packet: PacketEdge,
};

export type LabMode = 'FREE' | 'REVIEW' | 'CHALLENGE' | 'LEARN' | 'INTERVIEW';

export interface SystemDesignLabProps {
  mode?: LabMode;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  title?: string;
  description?: string;
  explanations?: any; // For review mode
  challengeData?: any; // For challenge mode
  architectureData?: Architecture; // For structured architecture view
  onContextChange?: (ctx: any) => void;
  onExit?: () => void;
  onSelectArchitecture?: (id: string) => void;
}

export function SystemDesignLabContent({ 
  mode = 'FREE', 
  initialNodes = [], 
  initialEdges = [], 
  title = 'System Design Lab',
  description = 'Drag and drop components to build your architecture.',
  explanations,
  challengeData,
  architectureData,
  onContextChange,
  onExit,
  onSelectArchitecture
}: SystemDesignLabProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [activeSimulatorTab, setActiveSimulatorTab] = useState<'TRAFFIC' | 'INSPECTOR' | 'CHAOS' | 'LABS'>('TRAFFIC');
  const [analysisMode, setAnalysisMode] = useState<'VALIDATE' | 'SIMULATE'>('VALIDATE');
  const [problemContext, setProblemContext] = useState('');
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRps, setSimulationRps] = useState(150);
  const [simulationUsers, setSimulationUsers] = useState(5000);
  const [metrics, setMetrics] = useState({
    totalCost: 0,
    maxLatency: 0,
    bottlenecks: [] as string[],
    violations: [] as string[]
  });
  const [trafficVolume, setTrafficVolume] = useState(100);
  const [faultInjection, setFaultInjection] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExportingIac, setIsExportingIac] = useState(false);
  const [iacResult, setIacResult] = useState<any>(null);
  const [showIacModal, setShowIacModal] = useState(false);
  const [activeEvents, setActiveEvents] = useState<string[]>([]);
  const [isSimulatingOrder, setIsSimulatingOrder] = useState(false);
  const [isSimulatingCache, setIsSimulatingCache] = useState(false);
  const [orderStep, setOrderStep] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Selected Node/Component Info State
  const [selectedNodeData, setSelectedNodeData] = useState<ComponentDefinition | null>(null);
  const [pendingDrop, setPendingDrop] = useState<{comp: ComponentDefinition, position: {x: number, y: number}} | null>(null);
  
  // Documentation Panel State
  const [showDocumentation, setShowDocumentation] = useState(mode === 'REVIEW');
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Large Architecture Helpers
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [showRequirementsScratchpad, setShowRequirementsScratchpad] = useState(false);

  const filteredNodes = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return nodes.map(n => ({
      ...n,
      hidden: search ? !n.data.label.toLowerCase().includes(search) && !n.data.defId.toLowerCase().includes(search) : false,
      selected: n.id === selectedNodeId || n.id === highlightedNodeId
    }));
  }, [nodes, searchQuery, selectedNodeId, highlightedNodeId]);

  const [isCatalogOpen, setIsCatalogOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsCatalogOpen(true);
    };

    const handleToggle = () => {
      setIsCatalogOpen(prev => !prev);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('trigger-catalog-toggle', handleToggle);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('trigger-catalog-toggle', handleToggle);
    };
  }, []);

  // EDA Specific Simulation State
  const [edaMode, setEdaMode] = useState<'STANDARD' | 'KAFKA' | 'RELIABILITY'>('STANDARD');
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [eventLog, setEventLog] = useState<{id: string, time: string, msg: string, type: 'info' | 'error' | 'success'}[]>([]);

  // Component Library State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Load initial if provided
  useEffect(() => {
    if (initialNodes.length > 0) setNodes(initialNodes);
    if (initialEdges.length > 0) setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        // Update Node Metrics
        setNodes(nds => nds.map(node => {
          if (node.type === 'custom' || node.type === 'group') {
            const isKafka = node.id.includes('kafka') || node.id.includes('broker') || node.id.includes('topic') || node.data?.defId?.includes('kafka');
            const isDb = node.id.includes('db') || node.data?.defId?.includes('db');
            
            return {
              ...node,
              data: {
                ...node.data,
                cpu: isKafka || isDb ? Math.floor(Math.random() * 60) + 10 : undefined,
                mem: isKafka || isDb ? Math.floor(Math.random() * 60) + 20 : undefined,
                lag: node.id.includes('topic') ? Math.floor(Math.random() * 200) : undefined,
                offset: node.id.includes('topic') || node.id.includes('broker') ? Math.floor(Math.random() * 1000) + 50000 : undefined,
              }
            };
          }
          return node;
        }));
        
        // Update Edge Intensity
        const baseIntensity = Math.max(1, Math.floor(simulationRps / 50));
        setEdges(eds => eds.map(edge => ({
          ...edge,
          type: 'packet',
          data: {
            ...edge.data,
            intensity: Math.floor(Math.random() * (baseIntensity + 2)) + 1
          }
        })));
        
      }, 500);
    } else {
      setNodes(nds => nds.map(node => ({
        ...node,
        data: {
          ...node.data,
          cpu: undefined, mem: undefined, lag: undefined, offset: undefined
        }
      })));
      setEdges(eds => eds.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          intensity: 0
        }
      })));
    }
    return () => clearInterval(interval);
  }, [isSimulating, simulationRps, setNodes, setEdges]);

  useEffect(() => {
    let totalCost = 0;
    nodes.forEach(n => {
      totalCost += (n.data?.cost !== undefined ? n.data.cost : 50);
    });

    // Validations (Linter)
    const violations: string[] = [];
    let hasLoadBalancer = false;
    let hasWaf = false;
    let hasDatabase = false;
    
    nodes.forEach(n => {
      const def = COMPONENT_CATALOG.find(c => c.id === n.data.defId);
      if (def?.id === 'lb') hasLoadBalancer = true;
      if (def?.id === 'waf') hasWaf = true;
      if (def?.category === 'Databases') hasDatabase = true;
    });

    if (nodes.length > 5 && !hasLoadBalancer) {
      violations.push("Scalability Warning: Multi-node architecture lacks a Load Balancer.");
    }
    
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (source && target) {
        const sourceDef = COMPONENT_CATALOG.find(c => c.id === source.data.defId);
        const targetDef = COMPONENT_CATALOG.find(c => c.id === target.data.defId);
        if (sourceDef?.type === 'Client' && targetDef?.category === 'Databases') {
          violations.push(`Security Violation: Direct Database Exposure (${source.data.label} -> ${target.data.label}). Use an API Gateway or Service layer.`);
        }
        if (sourceDef?.type === 'Client' && targetDef?.category === 'Compute' && !hasWaf) {
          violations.push(`Security Warning: Client directly accessing Compute without WAF/Gateway.`);
        }
        if (sourceDef?.category === 'Databases' && targetDef?.category === 'Databases') {
          violations.push(`Architecture Warning: Direct DB-to-DB connections can lead to tight coupling.`);
        }
      }
    });

    // DAG Traversal for Latency and Throughput
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    nodes.forEach(n => {
      adj.set(n.id, []);
      inDegree.set(n.id, 0);
    });
    
    edges.forEach(e => {
      if (adj.has(e.source) && inDegree.has(e.target)) {
        adj.get(e.source)!.push(e.target);
        inDegree.set(e.target, inDegree.get(e.target)! + 1);
      }
    });

    let rootNodes = nodes.filter(n => inDegree.get(n.id) === 0);
    if (rootNodes.length === 0) rootNodes = nodes; // fallback for cycles
    
    const nodeRps = new Map<string, number>();
    nodes.forEach(n => nodeRps.set(n.id, 0));
    
    rootNodes.forEach(n => {
       nodeRps.set(n.id, simulationRps / (rootNodes.length || 1));
    });

    const bottlenecks: string[] = [];
    const nodeLatency = new Map<string, number>();
    nodes.forEach(n => nodeLatency.set(n.id, n.data?.baseLatency !== undefined ? n.data.baseLatency : 50));

    const queue = [...rootNodes.map(n => n.id)];
    const visited = new Set<string>();
    let maxLatency = 0;

    while (queue.length > 0) {
      const currId = queue.shift()!;
      if (visited.has(currId)) continue;
      visited.add(currId);

      const currNode = nodes.find(n => n.id === currId);
      if (!currNode) continue;
      
      const currentRps = nodeRps.get(currId)!;
      const maxThroughput = currNode.data?.maxThroughput !== undefined ? currNode.data.maxThroughput : 1000;
      
      if (currentRps > maxThroughput) {
        if (!bottlenecks.includes(currNode.data.label)) {
           bottlenecks.push(currNode.data.label);
        }
      }

      const neighbors = adj.get(currId) || [];
      const currentLat = nodeLatency.get(currId)!;
      maxLatency = Math.max(maxLatency, currentLat);

      neighbors.forEach(nextId => {
         const nextNode = nodes.find(n => n.id === nextId);
         if (nextNode) {
            nodeRps.set(nextId, nodeRps.get(nextId)! + (currentRps / neighbors.length));
            nodeLatency.set(nextId, Math.max(nodeLatency.get(nextId)!, currentLat + (nextNode.data?.baseLatency !== undefined ? nextNode.data.baseLatency : 50)));
            if (!visited.has(nextId)) {
               queue.push(nextId);
            }
         }
      });
    }

    setMetrics({ totalCost, maxLatency, bottlenecks, violations });
    
    if (isSimulating) {
      setNodes(nds => {
        let changed = false;
        const newNodes = nds.map(n => {
          const isBottleneck = bottlenecks.includes(n.data.label);
          const currentStatus = n.data.status;
          // Only touch ERROR status based on bottleneck
          let targetStatus = currentStatus;
          if (isBottleneck) targetStatus = 'ERROR';
          else if (currentStatus === 'ERROR') targetStatus = undefined;
          
          if (currentStatus !== targetStatus) {
             changed = true;
             return { ...n, data: { ...n.data, status: targetStatus }};
          }
          return n;
        });
        return changed ? newNodes : nds;
      });
    }

  }, [nodes, edges, simulationRps, isSimulating]);

  const onContextChangeRef = useRef(onContextChange);
  useEffect(() => {
    onContextChangeRef.current = onContextChange;
  }, [onContextChange]);

  useEffect(() => {
    const componentTypes = nodes.map(n => n.data.label);
    onContextChangeRef.current?.({
       topic: 'System Design Lab',
       mode,
       components_in_design: componentTypes,
       selected_component: selectedNodeData ? selectedNodeData.label : 'None'
    });
  }, [nodes.length, selectedNodeData, mode]); 

  const onConnect = useCallback((params: Connection) => {
    const edge = { ...params, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' }, style: { stroke: '#818cf8', strokeWidth: 2 } };
    setEdges((eds) => addEdge(edge, eds));
  }, [setEdges]);

  const onDragStart = (event: React.DragEvent, comp: ComponentDefinition) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(comp));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const typeDataString = event.dataTransfer.getData('application/reactflow');

      if (!typeDataString || !reactFlowBounds || !reactFlowInstance) return;

      const comp: ComponentDefinition = JSON.parse(typeDataString);
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      setPendingDrop({ comp, position });
    },
    [reactFlowInstance]
  );

  const confirmPendingDrop = () => {
    if (!pendingDrop) return;
    const { comp, position } = pendingDrop;
    const newNode = {
      id: uuidv4(),
      type: 'custom',
      position,
      data: { label: comp.label, color: comp.color, iconName: comp.iconName, defId: comp.id },
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeData(comp); // Open the right panel automatically for more learning
    setPendingDrop(null);
  };

  const cancelPendingDrop = () => {
    setPendingDrop(null);
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodesDelete = useCallback((deleted: Node[]) => {
    setNodes(nodes.filter(n => !deleted.find(d => d.id === n.id)));
    if (deleted.some(d => selectedNodeData && d.data.defId === selectedNodeData.id)) {
      setSelectedNodeData(null);
    }
  }, [nodes, setNodes, selectedNodeData]);

  const onEdgesDelete = useCallback((deleted: Edge[]) => {
    setEdges(edges.filter(e => !deleted.find(d => d.id === e.id)));
  }, [edges, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const def = COMPONENT_CATALOG.find(c => c.id === node.data.defId);
    if (def) setSelectedNodeData(def);
    setSelectedNodeId(node.id);
  }, []);
  
  const onPaneClick = useCallback(() => {
    setSelectedNodeData(null);
    setSelectedNodeId(null);
  }, []);

  const exportArchitecture = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importArchitecture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.nodes && parsed.edges) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
        }
      } catch (err) {
        console.error("Failed to parse architecture", err);
        alert("Invalid architecture file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportIac = async (target: string) => {
    if (nodes.length === 0) return;
    setIsExportingIac(true);
    setIacResult(null);
    setShowIacModal(true);

    const design = {
      nodes: nodes.map(n => ({ id: n.id, type: n.data.label, defId: n.data.defId })),
      edges: edges.map(e => ({ source: e.source, target: e.target, label: e.label }))
    };

    try {
      const currentSettings = loadSettings();
      const res = await fetch('/api/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: JSON.stringify({ canvas_state: design, target }), 
          mode: 'IAC_EXPORT', 
          settings: currentSettings 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      let resultText = data.result;
      if (resultText.startsWith('```')) {
        const firstNewline = resultText.indexOf('\n');
        const lastBackticks = resultText.lastIndexOf('```');
        if (firstNewline !== -1 && lastBackticks !== -1) {
          resultText = resultText.substring(firstNewline + 1, lastBackticks).trim();
        }
      }

      setIacResult(JSON.parse(resultText));
    } catch (err) {
      console.error(err);
      setIacResult({ error: "Failed to generate IaC. See console for details." });
    } finally {
      setIsExportingIac(false);
    }
  };

  const runAnalysis = async () => {
    if (nodes.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const design = {
      nodes: nodes.map(n => ({ id: n.id, type: n.data.label, defId: n.data.defId })),
      edges: edges.map(e => ({ source: e.source, target: e.target, label: e.label }))
    };

    let payload = '';
    if (analysisMode === 'VALIDATE') {
      payload = JSON.stringify({ problem_context: problemContext || title, user_design: design });
    } else {
      payload = JSON.stringify({ traffic_volume: trafficVolume, fault_injection: faultInjection, user_design: design });
    }

    try {
      const currentSettings = loadSettings();
      const res = await fetch('/api/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: payload, mode: analysisMode, settings: currentSettings }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      let resultText = data.result;
      if (resultText.startsWith('```')) {
        const firstNewline = resultText.indexOf('\n');
        const lastBackticks = resultText.lastIndexOf('```');
        if (firstNewline !== -1 && lastBackticks !== -1) {
          resultText = resultText.substring(firstNewline + 1, lastBackticks).trim();
        }
      }

      setAnalysisResult(JSON.parse(resultText));
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runOrderSimulation = async () => {
    if (isSimulatingOrder) return;
    setIsSimulatingOrder(true);
    setOrderStep(1);
    
    const steps = [
      { msg: "🛒 Customer places order", type: 'info' as const, highlight: 'gateway', edgeId: 'e4' },
      { msg: "📝 Order Service creates PENDING record", type: 'info' as const, highlight: 'svc-order', edgeId: 'e5' },
      { msg: "🚀 Event 'OrderCreated' published to Kafka", type: 'success' as const, highlight: 'kafka', edgeId: 'e6' },
      { msg: "📦 Inventory Service reserving stock...", type: 'info' as const, highlight: 'svc-inventory', edgeId: 'e7' },
      { msg: "💳 Payment Service initiating transaction...", type: 'info' as const, highlight: 'svc-payment', edgeId: 'e8' },
      { msg: "✅ Payment Success! 'PaymentCompleted' published", type: 'success' as const, highlight: 'kafka', edgeId: 'e9' },
      { msg: "🚚 Shipping Service starting fulfillment", type: 'info' as const, highlight: 'svc-shipping', edgeId: 'e10' },
      { msg: "📧 Notification Service sending receipt", type: 'success' as const, highlight: 'svc-notif', edgeId: 'e11' }
    ];

    for (let i = 0; i < steps.length; i++) {
      setOrderStep(i + 1);
      setEventLog(prev => [{
        id: uuidv4(),
        time: new Date().toLocaleTimeString(),
        msg: steps[i].msg,
        type: steps[i].type
      }, ...prev].slice(0, 15));
      setHighlightedNodeId(steps[i].highlight);

      // Camera transition for better focus
      if (reactFlowInstance) {
        const node = nodes.find(n => n.id === steps[i].highlight);
        if (node) {
          reactFlowInstance.setCenter(node.position.x + 100, node.position.y + 100, { zoom: isMobile ? 0.8 : 1.2, duration: 800 });
        }
      }

      // Animate edge
      if (steps[i].edgeId) {
        setEdges(eds => eds.map(e => 
          e.id === steps[i].edgeId ? { ...e, type: 'packet', data: { ...e.data, isAnimating: true } } : e
        ));
      }

      await new Promise(resolve => setTimeout(resolve, (isMobile ? 2000 : 1500) / simulationSpeed));

      // Stop edge animation
      if (steps[i].edgeId) {
        setEdges(eds => eds.map(e => 
          e.id === steps[i].edgeId ? { ...e, data: { ...e.data, isAnimating: false } } : e
        ));
      }
    }
    
    setHighlightedNodeId(null);
    setIsSimulatingOrder(false);
    setOrderStep(0);
  };

  const runCacheSimulation = async () => {
    if (isSimulatingCache) return;
    setIsSimulatingCache(true);
    
    const isHit = Math.random() > 0.5;
    const steps = [
      { msg: "🔍 User requests Product Data", type: 'info' as const, highlight: 'gateway' },
      { msg: "⚡ Checking CDN / Redis Cache...", type: 'info' as const, highlight: 'db-inventory' },
      ...(isHit ? [
        { msg: "🚀 Cache HIT! Returning data immediately", type: 'success' as const, highlight: 'db-inventory' }
      ] : [
        { msg: "❌ Cache MISS. Fetching from Database...", type: 'error' as const, highlight: 'db-order' },
        { msg: "💾 Database returned data", type: 'info' as const, highlight: 'db-order' },
        { msg: "🔄 Updating Cache for next request", type: 'success' as const, highlight: 'db-inventory' }
      ]),
      { msg: "✅ Data returned to User", type: 'success' as const, highlight: 'gateway' }
    ];

    for (let i = 0; i < steps.length; i++) {
      setEventLog(prev => [{
        id: uuidv4(),
        time: new Date().toLocaleTimeString(),
        msg: steps[i].msg,
        type: steps[i].type
      }, ...prev].slice(0, 15));
      setHighlightedNodeId(steps[i].highlight);

      // Camera transition
      if (reactFlowInstance) {
        const node = nodes.find(n => n.id === steps[i].highlight);
        if (node) {
          reactFlowInstance.setCenter(node.position.x + 100, node.position.y + 100, { zoom: isMobile ? 0.9 : 1.3, duration: 600 });
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    
    setHighlightedNodeId(null);
    setIsSimulatingCache(false);
  };

  const publishEvent = () => {
    const sourceNode = nodes.find(n => n.data.defId === 'net-client' || n.data.defId === 'comp-server');
    if (!sourceNode) return;
    
    const eventId = uuidv4();
    setActiveEvents(prev => [...prev, eventId]);
    
    // Animate all outgoing edges from source
    const outgoingEdges = edges.filter(e => e.source === sourceNode.id);
    
    setEventLog(prev => [{
      id: uuidv4(),
      time: new Date().toLocaleTimeString(),
      msg: `Event initiated from ${sourceNode.data.label}`,
      type: 'info' as const
    }, ...prev].slice(0, 10));

    // Simple simulation of message propagation
    setTimeout(() => {
      setActiveEvents(prev => prev.filter(id => id !== eventId));
      
      // Update nodes with some "activity"
      setNodes(nds => nds.map(n => {
        if (n.data.defId?.includes('kafka') || n.data.defId?.includes('msg')) {
          return {
            ...n,
            data: {
              ...n.data,
              offset: (n.data.offset || 1000) + Math.floor(Math.random() * 10),
              lag: Math.max(0, (n.data.lag || 0) + (Math.random() > 0.8 ? 5 : -2)),
              status: n.data.lag > 20 ? 'LAGGING' : 'HEALTHY'
            }
          };
        }
        return n;
      }));
    }, 2000);
  };

  const triggerRetry = () => {
    setEventLog(prev => [{
      id: uuidv4(),
      time: new Date().toLocaleTimeString(),
      msg: "Transient error detected. Triggering exponential backoff retry...",
      type: 'info' as const
    }, ...prev].slice(0, 10));
  };

  const sendToDLQ = () => {
     setEventLog(prev => [{
      id: uuidv4(),
      time: new Date().toLocaleTimeString(),
      msg: "Max retries exceeded. Moving message to Dead Letter Queue (DLQ).",
      type: 'error' as const
    }, ...prev].slice(0, 10));
    
    setNodes(nds => nds.map(n => {
      if (n.data.defId === 'reliability-dlq') {
        return { ...n, data: { ...n.data, status: 'ERROR', lag: (n.data.lag || 0) + 1 } };
      }
      return n;
    }));
  };

  const filteredComponents = COMPONENT_CATALOG.filter(comp => {
    const matchesSearch = comp.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          comp.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || comp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full w-full bg-[#0A0A0B] relative overflow-hidden flex-col">
      {/* Top Header for Specific Modes */}
      {(mode === 'REVIEW' || mode === 'CHALLENGE') && (
        <div className="h-20 border-b border-[#1F1F22] bg-[#111113] flex items-center justify-between px-8 shrink-0 z-10 shadow-lg relative overflow-hidden">
           {/* Abstract Background Decoration */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
           
           <div className="relative z-10 flex items-center gap-6">
              {onExit && (
                <button onClick={onExit} className="text-gray-500 hover:text-white transition-colors">
                   <ChevronUp className="w-6 h-6 rotate-[270deg]" />
                </button>
              )}
              <div className="flex flex-col">
                 <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-100 tracking-tight">{architectureData?.title || title}</h2>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                       {architectureData?.difficulty || 'Architecture'}
                    </span>
                 </div>
                 <p className="text-xs text-gray-400 mt-1 max-w-2xl line-clamp-1">{architectureData?.description || description}</p>
              </div>
           </div>

           <div className="flex items-center gap-3 relative z-10">
              <button 
                onClick={runOrderSimulation}
                disabled={isSimulatingOrder}
                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${
                  isSimulatingOrder 
                    ? 'bg-indigo-600/20 text-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
                }`}
              >
                <Play className={`w-4 h-4 ${isSimulatingOrder ? 'animate-pulse' : ''}`} />
                {isSimulatingOrder ? 'Simulation Running...' : 'Play Simulation'}
              </button>
              <button className="px-5 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-gray-300 hover:text-white hover:border-gray-600 transition-all text-sm font-bold flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Configure Playground
              </button>
           </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative flex-col lg:flex-row">
        
        {/* Component Library Sidebar */}
        <AnimatePresence>
          {(isCatalogOpen || !isMobile) && (
            <>
              {isMobile && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsCatalogOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                />
              )}
              <motion.div 
                initial={isMobile ? { x: -300 } : false}
                animate={{ x: 0 }}
                exit={isMobile ? { x: -300 } : undefined}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`${isMobile ? 'fixed inset-y-0 left-0 z-[100] w-[280px]' : 'relative w-72'} bg-[#111113] border-r border-[#1F1F22] flex flex-col shrink-0 shadow-2xl lg:shadow-none`}
              >
                <div className="p-4 border-b border-[#1F1F22] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400" /> Catalog
                    </h3>
                    {isMobile && (
                      <button onClick={() => setIsCatalogOpen(false)} className="p-1 text-gray-500 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                      <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        placeholder="Search components..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1A1A1D] border border-[#27272A] rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                      />
                  </div>
                  <select 
                    value={selectedCategory} 
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full bg-[#1A1A1D] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All">All Categories</option>
                    {COMPONENT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {filteredComponents.map((comp) => {
                    const Icon = ICONS[comp.iconName] || Box;
                    return (
                      <ComponentHoverCard key={comp.id} component={comp}>
                        <div
                          onDragStart={(event) => onDragStart(event, comp)}
                          draggable
                          className="flex items-center gap-3 p-3 bg-[#1A1A1D] border border-[#27272A] rounded-lg cursor-grab hover:border-indigo-500/50 hover:bg-[#1F1F22] transition-all group"
                        >
                          <div className={`w-8 h-8 rounded-md ${comp.color} flex items-center justify-center bg-opacity-20 shrink-0`}>
                            <Icon className={`w-4 h-4 ${comp.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm text-gray-200 font-medium truncate">{comp.label}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wide truncate">{comp.category}</div>
                          </div>
                        </div>
                      </ComponentHoverCard>
                    );
                  })}
                  {filteredComponents.length === 0 && (
                    <div className="text-center text-gray-500 text-sm mt-8">No components found.</div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        {/* Main Area */}
        <div className={`flex-1 flex flex-col lg:flex-row overflow-hidden relative`}>
          {/* ReactFlow Canvas Area */}
          <div className={`relative bg-[#0A0A0B] overflow-hidden transition-all duration-500 w-full ${
            isMobile && showDocumentation ? 'h-[40vh] border-b border-[#1F1F22]' : 'flex-1 h-full'
          }`} ref={reactFlowWrapper}>
            
            {/* Diagram UI Overlays */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
               <div className="p-1 bg-[#111113]/80 backdrop-blur-md border border-[#27272A] rounded-xl flex items-center gap-1">
                  <div className="flex items-center gap-2 px-3 border-r border-[#27272A]">
                    <Search className="w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Find..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-xs text-white placeholder:text-gray-600 w-24 sm:w-32"
                    />
                  </div>
                  <button 
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    className={`p-1.5 rounded-lg transition-colors ${isFocusMode ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-[#1A1A1D]'}`}
                    title="Focus Mode"
                  >
                    <Target className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setShowMiniMap(!showMiniMap)}
                    className={`p-1.5 rounded-lg transition-colors ${showMiniMap ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-[#1A1A1D]'}`}
                    title="Mini-map"
                  >
                    <MapIcon className="w-4 h-4" />
                  </button>
               </div>
            </div>

            <ReactFlow
              nodes={filteredNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodesDelete={onNodesDelete}
              onEdgesDelete={onEdgesDelete}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              className="bg-[#0A0A0B]"
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#27272A" gap={16} size={1} />
              <Controls className="bg-[#1A1A1D] border-[#27272A] fill-gray-300 stroke-gray-300" />
              {showMiniMap && (
                <MiniMap 
                  nodeColor={(n: any) => n.data?.color ? '#6366f1' : '#333'}
                  maskColor="rgba(0, 0, 0, 0.7)"
                  style={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid #27272A' }}
                />
              )}
              
              {mode === 'FREE' && (
                 <Panel position="bottom-left" className="m-4 max-w-sm w-full space-y-4">
                   {/* Security/Constraint Violations */}
                   {metrics.violations.length > 0 && (
                     <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-left">
                       <h4 className="text-red-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                         <ShieldAlert className="w-4 h-4" /> Architectural Violations
                       </h4>
                       <ul className="space-y-2">
                         {metrics.violations.map((v, idx) => (
                           <li key={idx} className="text-red-200/90 text-xs flex gap-2 items-start">
                             <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1" />
                             <span>{v}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
                   
                   {/* BOM Dashboard */}
                   <div className="bg-[#111113]/90 border border-[#27272A] rounded-xl p-4 shadow-2xl backdrop-blur-md">
                     <h4 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-3">Live Metrics & BOM</h4>
                     <div className="space-y-3">
                       <div className="flex justify-between items-center border-b border-[#27272A] pb-3">
                         <span className="text-xs text-gray-500 font-medium flex items-center gap-2">
                           <Activity className="w-3.5 h-3.5" /> Traffic
                         </span>
                         <div className="flex items-center gap-2 w-32">
                           <input 
                             type="range" 
                             min="10" max="5000" step="10"
                             value={simulationRps}
                             onChange={(e) => setSimulationRps(Number(e.target.value))}
                             className="w-full accent-indigo-500 h-1.5 bg-[#1A1A1D] rounded-full appearance-none"
                           />
                           <span className="text-xs font-mono text-gray-300 w-12 text-right">{simulationRps}RPS</span>
                         </div>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-gray-500">Total Est. Cost</span>
                         <span className="text-sm font-mono text-emerald-400">${metrics.totalCost}/mo</span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-gray-500">Max System Latency</span>
                         <span className="text-sm font-mono text-indigo-400">{metrics.maxLatency}ms</span>
                       </div>
                       <div className="flex justify-between items-center border-t border-[#27272A] pt-2">
                         <span className="text-xs text-gray-500">Bottlenecks</span>
                         {metrics.bottlenecks.length > 0 ? (
                           <span className="text-xs font-bold text-red-400 truncate max-w-[150px]" title={metrics.bottlenecks.join(', ')}>
                             {metrics.bottlenecks.join(', ')}
                           </span>
                         ) : (
                           <span className="text-xs font-bold text-emerald-400">None detected</span>
                         )}
                       </div>
                     </div>
                   </div>
                 </Panel>
              )}

              <Panel position="top-right" className="m-4 flex gap-2">
                {architectureData?.explanations && (
                   <button 
                     onClick={() => setShowDocumentation(!showDocumentation)}
                     className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-2xl transition-all border ${
                       showDocumentation 
                         ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/20 ring-4 ring-indigo-500/10' 
                         : 'bg-[#111113] border-[#27272A] text-gray-400 hover:text-white'
                     }`}
                   >
                     <BookOpen className="w-4 h-4" /> 
                     {isMobile ? '' : (showDocumentation ? 'Close Guide' : 'Show Guide')}
                   </button>
                )}
                <button 
                  onClick={() => setShowRequirementsScratchpad(!showRequirementsScratchpad)} 
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg transition-all border ${
                    showRequirementsScratchpad 
                      ? 'bg-orange-600 border-orange-500 text-white shadow-orange-500/20' 
                      : 'bg-[#1A1A1D]/90 border-[#27272A] text-gray-300 hover:text-orange-400'
                  }`}
                  title="Requirements Scratchpad"
                >
                  <Sliders className="w-4 h-4 text-orange-500" />
                  {isMobile ? '' : 'Scratchpad'}
                </button>
                <button onClick={exportArchitecture} className="bg-[#1A1A1D]/90 border border-[#27272A] text-gray-300 hover:text-indigo-400 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg transition-colors">
                  <Download className="w-4 h-4" /> Export
                </button>
              <label className="bg-[#1A1A1D]/90 border border-[#27272A] text-gray-300 hover:text-indigo-400 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg cursor-pointer transition-colors">
                <Upload className="w-4 h-4" /> Import
                <input type="file" accept=".json" onChange={importArchitecture} className="hidden" />
              </label>
              <button onClick={() => { setNodes([]); setEdges([]); }} className="bg-[#1A1A1D]/90 border border-[#27272A] text-gray-300 hover:text-red-400 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg transition-colors">
                <Trash2 className="w-4 h-4" /> Clear
              </button>
              
              <div className="w-[1px] h-6 bg-[#27272A] mx-1" />
              
              <div className="relative group">
                <button className="bg-[#1A1A1D]/90 border border-[#27272A] text-gray-300 hover:text-indigo-400 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg transition-colors">
                  <Code className="w-4 h-4" /> Export IaC
                </button>
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-[#1A1A1D] border border-[#27272A] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
                  <button onClick={() => exportIac('docker-compose')} className="px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-indigo-500/20 hover:bg-[#27272A] transition-colors border-b border-[#27272A]">
                    Docker Compose
                  </button>
                  <button onClick={() => exportIac('terraform')} className="px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-indigo-500/20 hover:bg-[#27272A] transition-colors">
                    Terraform
                  </button>
                </div>
              </div>
            </Panel>
            {mode === 'REVIEW' && (
              <Panel position="bottom-center" className="mb-8">
                 <div className="bg-[#111113]/90 backdrop-blur-xl border border-[#27272A] rounded-2xl p-3 flex items-center gap-4 shadow-2xl">
                    <button 
                      onClick={() => setSimulationSpeed(0.5)} 
                      className={`text-xs font-bold px-2 py-1 rounded ${simulationSpeed === 0.5 ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-white'}`}
                    >0.5x</button>
                    <button 
                      onClick={() => setSimulationSpeed(1)} 
                      className={`text-xs font-bold px-2 py-1 rounded ${simulationSpeed === 1 ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-white'}`}
                    >1x</button>
                    <button 
                      onClick={() => setSimulationSpeed(2)} 
                      className={`text-xs font-bold px-2 py-1 rounded ${simulationSpeed === 2 ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-white'}`}
                    >2x</button>
                    
                    <div className="w-[1px] h-6 bg-[#27272A] mx-2" />

                    <button 
                      onClick={() => setOrderStep(Math.max(0, orderStep - 1))}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Step Back"
                    >
                       <RotateCcw className="w-5 h-5" />
                    </button>

                    <button 
                      onClick={() => setIsSimulating(!isSimulating)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isSimulating 
                          ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                          : 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                      }`}
                    >
                      {isSimulating ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                    </button>
                    
                    <button 
                      onClick={() => { setIsSimulatingOrder(false); setOrderStep(0); setHighlightedNodeId(null); setEdges(eds => eds.map(e => ({ ...e, type: 'default', data: { ...e.data, isAnimating: false } }))); }}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Stop"
                    >
                       <Square className="w-5 h-5 fill-current" />
                    </button>

                    <div className="w-[1px] h-6 bg-[#27272A] mx-2" />
                    
                    <div className="flex flex-col gap-1 w-48">
                       <div className="flex justify-between text-[10px] font-bold text-gray-500">
                          <span>Progress</span>
                          <span className="text-indigo-400">{orderStep}/8</span>
                       </div>
                       <input 
                         type="range" 
                         min="0" 
                         max="8" 
                         value={orderStep} 
                         readOnly
                         className="w-full h-1 bg-[#1A1A1D] rounded-full appearance-none accent-indigo-500 pointer-events-none" 
                       />
                    </div>
                 </div>
              </Panel>
            )}
            </ReactFlow>
          </div>

          {/* Contextual Overlays */}
          
          {/* Challenge Prompt Overlay (Left side of Canvas) */}
          {mode === 'CHALLENGE' && challengeData && (
             <div className="absolute top-4 left-4 w-80 bg-[#111113]/90 backdrop-blur-md border border-amber-500/30 rounded-xl shadow-2xl p-5 z-10 pointer-events-none">
                <div className="flex items-center gap-2 mb-3">
                   <Edit3 className="w-5 h-5 text-amber-400" />
                   <h3 className="font-bold text-amber-400 uppercase tracking-wide text-sm">Challenge Requirements</h3>
                </div>
                <div className="space-y-4">
                   <div>
                     <h4 className="text-xs font-semibold text-gray-400 mb-1">Functional</h4>
                     <ul className="list-disc pl-4 text-sm text-gray-200 space-y-1">
                        {challengeData.requirements.map((r: string, i: number) => <li key={i}>{r}</li>)}
                     </ul>
                   </div>
                   <div>
                     <h4 className="text-xs font-semibold text-gray-400 mb-1">Constraints</h4>
                     <ul className="list-disc pl-4 text-sm text-gray-200 space-y-1">
                        {challengeData.constraints.map((c: string, i: number) => <li key={i}>{c}</li>)}
                     </ul>
                   </div>
                </div>
             </div>
          )}

          {/* Component Info Overlay (Right Side) */}
          {selectedNodeData && (
             <div className={`absolute ${
               isMobile 
                 ? 'inset-x-4 bottom-4 h-[60vh]' 
                 : `top-4 ${mode === 'INTERVIEW' ? 'right-[400px]' : 'right-4'} bottom-4 w-96`
             } bg-[#111113]/95 backdrop-blur-xl border border-[#27272A] rounded-2xl shadow-2xl z-20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 lg:slide-in-from-right-4 transition-all duration-300`}>
                <div className="p-4 border-b border-[#1F1F22] flex items-center justify-between bg-[#1A1A1D]">
                   <div className="flex items-center gap-3 w-full">
                      <div className={`w-10 h-10 rounded-lg shrink-0 ${selectedNodeData.color} bg-opacity-20 flex items-center justify-center`}>
                        {(() => {
                           const Icon = ICONS[selectedNodeData.iconName] || Box;
                           return <Icon className={`w-5 h-5 ${selectedNodeData.color.replace('bg-', 'text-')}`} />;
                        })()}
                      </div>
                      <div className="w-full">
                         {mode === 'FREE' ? (
                           <input 
                             type="text" 
                             value={nodes.find(n => n.id === selectedNodeId)?.data?.label || selectedNodeData.label}
                             onChange={(e) => {
                               setNodes(nds => nds.map(n => n.id === selectedNodeId ? { ...n, data: { ...n.data, label: e.target.value } } : n));
                             }}
                             className="bg-transparent border-none text-white font-bold w-full focus:outline-none focus:ring-0 p-0 text-lg"
                             placeholder="Component Name"
                           />
                         ) : (
                           <h3 className="text-white font-bold">{nodes.find(n => n.id === selectedNodeId)?.data?.label || selectedNodeData.label}</h3>
                         )}
                         <p className="text-xs text-gray-400">{selectedNodeData.category}</p>
                      </div>
                   </div>
                   <button onClick={() => { setSelectedNodeData(null); setSelectedNodeId(null); }} className="p-2 text-gray-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                   {/* Specific Explanation from Review Mode if available */}
                   {mode === 'REVIEW' && explanations?.components?.[selectedNodeData.id] && (
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                         <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Architecture Specifics</h4>
                         <p className="text-sm text-indigo-100/90 leading-relaxed">{explanations.components[selectedNodeData.id]}</p>
                      </div>
                   )}
                   
                   {mode === 'FREE' && selectedNodeId && nodes.find(n => n.id === selectedNodeId) && (
                     <div className="space-y-4">
                       <div className="bg-[#1A1A1D] border border-[#27272A] rounded-xl p-4">
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Component Styling</h4>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="text-xs text-gray-500 block mb-1">Color Theme</label>
                             <select 
                               className="w-full bg-[#111113] border border-[#27272A] text-sm text-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                               value={nodes.find(n => n.id === selectedNodeId)?.data?.color || selectedNodeData.color}
                               onChange={(e) => {
                                 setNodes(nds => nds.map(n => n.id === selectedNodeId ? { ...n, data: { ...n.data, color: e.target.value } } : n));
                               }}
                             >
                               <option value="bg-indigo-500">Indigo</option>
                               <option value="bg-blue-500">Blue</option>
                               <option value="bg-sky-500">Sky</option>
                               <option value="bg-cyan-500">Cyan</option>
                               <option value="bg-teal-500">Teal</option>
                               <option value="bg-emerald-500">Emerald</option>
                               <option value="bg-lime-500">Lime</option>
                               <option value="bg-amber-500">Amber</option>
                               <option value="bg-orange-500">Orange</option>
                               <option value="bg-red-500">Red</option>
                               <option value="bg-rose-500">Rose</option>
                               <option value="bg-purple-500">Purple</option>
                               <option value="bg-fuchsia-500">Fuchsia</option>
                               <option value="bg-slate-500">Slate</option>
                               <option value="bg-zinc-700">Zinc</option>
                             </select>
                           </div>
                           <div>
                             <label className="text-xs text-gray-500 block mb-1">Icon</label>
                             <select 
                               className="w-full bg-[#111113] border border-[#27272A] text-sm text-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                               value={nodes.find(n => n.id === selectedNodeId)?.data?.iconName || selectedNodeData.iconName}
                               onChange={(e) => {
                                 setNodes(nds => nds.map(n => n.id === selectedNodeId ? { ...n, data: { ...n.data, iconName: e.target.value } } : n));
                               }}
                             >
                               {Object.keys(ICONS).map(icon => (
                                 <option key={icon} value={icon}>{icon}</option>
                               ))}
                             </select>
                           </div>
                         </div>
                       </div>
                       
                       <div className="bg-[#1A1A1D] border border-[#27272A] rounded-xl p-4">
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                           <Activity className="w-3.5 h-3.5 text-indigo-400" />
                           Parametric Constraints
                         </h4>
                         <div className="space-y-3">
                           <div>
                             <label className="text-xs text-gray-500 block mb-1">Base Latency (ms)</label>
                             <input 
                               type="number" 
                               min="1"
                               className="w-full bg-[#111113] border border-[#27272A] text-sm text-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                               value={nodes.find(n => n.id === selectedNodeId)?.data?.baseLatency || 50}
                               onChange={(e) => {
                                 setNodes(nds => nds.map(n => n.id === selectedNodeId ? { ...n, data: { ...n.data, baseLatency: parseInt(e.target.value) || 0 } } : n));
                               }}
                             />
                           </div>
                           <div>
                             <label className="text-xs text-gray-500 block mb-1">Max Throughput (RPS)</label>
                             <input 
                               type="number" 
                               min="1"
                               className="w-full bg-[#111113] border border-[#27272A] text-sm text-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                               value={nodes.find(n => n.id === selectedNodeId)?.data?.maxThroughput || 1000}
                               onChange={(e) => {
                                 setNodes(nds => nds.map(n => n.id === selectedNodeId ? { ...n, data: { ...n.data, maxThroughput: parseInt(e.target.value) || 0 } } : n));
                               }}
                             />
                           </div>
                           <div>
                             <label className="text-xs text-gray-500 block mb-1">Monthly Cost ($)</label>
                             <input 
                               type="number" 
                               min="0"
                               className="w-full bg-[#111113] border border-[#27272A] text-sm text-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                               value={nodes.find(n => n.id === selectedNodeId)?.data?.cost || 50}
                               onChange={(e) => {
                                 setNodes(nds => nds.map(n => n.id === selectedNodeId ? { ...n, data: { ...n.data, cost: parseInt(e.target.value) || 0 } } : n));
                               }}
                             />
                           </div>
                         </div>
                       </div>
                     </div>
                   )}

                   <div>
                     <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">What is it?</h4>
                     <p className="text-sm text-gray-400 leading-relaxed mb-3">{selectedNodeData.description}</p>
                     
                     <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                       <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
                         <Info className="w-4 h-4" /> Beginner Explanation
                       </div>
                       <p className="text-indigo-200/80 leading-relaxed text-sm">"{selectedNodeData.beginnerExplanation}"</p>
                     </div>
                   </div>
                   
                   <div>
                     <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Why it exists</h4>
                     <p className="text-sm text-gray-400 leading-relaxed">{selectedNodeData.whyItExists}</p>
                   </div>
                   
                   <div>
                     <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">How it works</h4>
                     <p className="text-sm text-gray-400 leading-relaxed">{selectedNodeData.howItWorks}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Pros</h4>
                       <ul className="space-y-1">
                          {selectedNodeData.advantages.map((adv, i) => (
                             <li key={i} className="text-xs text-gray-400 flex items-start gap-1"><span className="text-emerald-500 mt-0.5">•</span> {adv}</li>
                          ))}
                       </ul>
                     </div>
                     <div>
                       <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Cons / Risks</h4>
                       <ul className="space-y-1">
                          {selectedNodeData.disadvantages.map((dis, i) => (
                             <li key={i} className="text-xs text-gray-400 flex items-start gap-1"><span className="text-red-500 mt-0.5">•</span> {dis}</li>
                          ))}
                       </ul>
                     </div>
                   </div>

                   <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                     <h4 className="text-amber-400 font-semibold text-xs mb-2 flex items-center gap-1 uppercase tracking-wider">
                       Common Mistakes
                     </h4>
                     <ul className="space-y-1">
                       {selectedNodeData.commonMistakes?.map((mistake, i) => (
                         <li key={i} className="text-amber-200/70 text-xs flex items-start gap-1.5">
                           <span className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                           <span>{mistake}</span>
                         </li>
                       ))}
                     </ul>
                   </div>

                   <div>
                     <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Related Components</h4>
                     <div className="flex flex-wrap gap-2">
                       {selectedNodeData.relatedComponents?.map((rel, i) => (
                         <span key={i} className="bg-[#1A1A1D] border border-[#27272A] text-gray-400 text-xs px-2 py-1 rounded-md">
                           {rel}
                         </span>
                       ))}
                     </div>
                   </div>
                   
                   <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                         <Info className="w-4 h-4" /> Interview Tip
                      </h4>
                      <p className="text-sm text-blue-100/80 italic">"{selectedNodeData.interviewTips}"</p>
                   </div>
                   
                   <div className="bg-[#111113] border border-[#27272A] rounded-xl p-4">
                     <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4" /> Live Metrics (Simulation)
                     </h4>
                     <div className="grid grid-cols-2 gap-3">
                       <div className="bg-[#1A1A1D] rounded-lg p-2 flex flex-col justify-center items-center">
                         <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Status</div>
                         <div className="text-emerald-400 text-sm font-medium flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Healthy</div>
                       </div>
                       <div className="bg-[#1A1A1D] rounded-lg p-2 flex flex-col justify-center items-center">
                         <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Load</div>
                         <div className="text-gray-200 text-sm font-medium">32%</div>
                       </div>
                       <div className="bg-[#1A1A1D] rounded-lg p-2 flex flex-col justify-center items-center">
                         <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Connections</div>
                         <div className="text-gray-200 text-sm font-medium">1,204</div>
                       </div>
                       <div className="bg-[#1A1A1D] rounded-lg p-2 flex flex-col justify-center items-center">
                         <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Latency</div>
                         <div className="text-gray-200 text-sm font-medium">14ms</div>
                       </div>
                     </div>
                   </div>

                   <button 
                     onClick={() => window.dispatchEvent(new CustomEvent('open-ai-mentor'))}
                     className="w-full py-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-indigo-400 font-medium transition-colors flex items-center justify-center gap-2"
                   >
                     <Brain className="w-4 h-4" />
                     Ask AI About This Component
                   </button>
                </div>
             </div>
          )}
        </div>
        
        {/* Documentation Panel */}
        <AnimatePresence>
          {showDocumentation && architectureData?.explanations && (
            <motion.div 
              initial={isMobile ? { y: '100%' } : { x: '100%' }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: '100%' } : { x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`z-40 ${isMobile ? 'fixed inset-x-0 bottom-0 h-[60vh] rounded-t-3xl shadow-2xl overflow-hidden border-t border-[#27272A]' : 'relative h-full'}`}
            >
              {isMobile && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-700 rounded-full z-50" />
              )}
              <DocumentationPanel 
                architecture={architectureData}
                onHighlightComponent={setHighlightedNodeId}
                activeComponentId={selectedNodeId}
                onLinkClick={(type, targetId) => {
                  if (type === 'ARCHITECTURE') onSelectArchitecture?.(targetId);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pending Drop Confirmation Modal */}
      {pendingDrop && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111113] border border-[#27272A] rounded-2xl shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl ${pendingDrop.comp.color} bg-opacity-20 flex items-center justify-center shrink-0`}>
                {(() => {
                  const Icon = ICONS[pendingDrop.comp.iconName] || Box;
                  return <Icon className={`w-6 h-6 ${pendingDrop.comp.color.replace('bg-', 'text-')}`} />;
                })()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Adding {pendingDrop.comp.label}</h3>
                <p className="text-sm text-gray-400">{pendingDrop.comp.description}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-[#1A1A1D] rounded-lg p-4 border border-[#27272A]">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Purpose</h4>
                <p className="text-sm text-gray-300">{pendingDrop.comp.whyItExists}</p>
              </div>
              
              <div className="bg-[#1A1A1D] rounded-lg p-4 border border-[#27272A]">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Commonly combined with</h4>
                <div className="flex flex-wrap gap-2">
                  {pendingDrop.comp.relatedComponents?.map(rel => (
                    <span key={rel} className="px-2 py-1 bg-[#111113] border border-[#27272A] rounded text-xs text-gray-400">
                      {rel}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={cancelPendingDrop}
                className="flex-1 py-2.5 rounded-lg border border-[#27272A] text-gray-400 hover:text-white hover:bg-[#1A1A1D] font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmPendingDrop}
                className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
              >
                Add Component
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Drawer */}
      {architectureData && (
        <div className={`absolute bottom-0 ${isMobile ? 'left-0' : 'left-72'} right-0 bg-[#0A0A0B] backdrop-blur-xl border-t border-[#1F1F22] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 z-30 flex flex-col ${isSimulatorOpen ? (isMobile ? 'h-[80vh]' : 'h-[60vh]') : 'h-12'}`}>
          {/* Header */}
          <div className="h-12 border-b border-[#1F1F22] bg-[#111113] flex items-center justify-between shrink-0 px-2">
            <div className="flex h-full">
              <button 
                onClick={() => { setIsSimulatorOpen(true); setActiveSimulatorTab('TRAFFIC'); }}
                className={`px-4 h-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeSimulatorTab === 'TRAFFIC' && isSimulatorOpen ? 'border-indigo-500 text-white bg-indigo-500/10' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                <Activity className="w-4 h-4" /> Traffic & Simulation
              </button>
              <button 
                onClick={() => { setIsSimulatorOpen(true); setActiveSimulatorTab('INSPECTOR'); }}
                className={`px-4 h-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeSimulatorTab === 'INSPECTOR' && isSimulatorOpen ? 'border-blue-500 text-white bg-blue-500/10' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                <Search className="w-4 h-4" /> Component Inspector
              </button>
              <button 
                onClick={() => { setIsSimulatorOpen(true); setActiveSimulatorTab('CHAOS'); }}
                className={`px-4 h-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeSimulatorTab === 'CHAOS' && isSimulatorOpen ? 'border-red-500 text-white bg-red-500/10' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                <SkullIcon className="w-4 h-4" /> Chaos Engineering
              </button>
              <button 
                onClick={() => { setIsSimulatorOpen(true); setActiveSimulatorTab('LABS'); }}
                className={`px-4 h-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeSimulatorTab === 'LABS' && isSimulatorOpen ? 'border-amber-500 text-white bg-amber-500/10' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                <Sliders className="w-4 h-4" /> Systems Labs
              </button>
            </div>
            <button 
              onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#1A1A1D] rounded-lg mr-2"
            >
              {isSimulatorOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>

          {/* Content */}
          {isSimulatorOpen && (
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              {activeSimulatorTab === 'TRAFFIC' && (
                <SimulationPlayground 
                  architecture={architectureData!} 
                  isPlaying={isSimulating}
                  onTogglePlay={() => setIsSimulating(!isSimulating)}
                  onReset={() => setIsSimulating(false)}
                  rps={simulationRps}
                  onRpsChange={setSimulationRps}
                  usersCount={simulationUsers}
                  onUsersChange={setSimulationUsers}
                />
              )}
              {activeSimulatorTab === 'INSPECTOR' && (
                <div className="flex flex-col h-full">
                  {selectedNodeData?.id?.includes('kafka') || selectedNodeData?.id?.includes('msg') ? (
                    <KafkaPlayground />
                  ) : selectedNodeData?.id?.includes('db') ? (
                    <ShardingPlayground />
                  ) : selectedNodeData?.id?.includes('cache') || selectedNodeData?.id?.includes('cdn') ? (
                    <CachePlayground />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                      <Search className="w-12 h-12 text-gray-700 mb-4" />
                      <h3 className="text-lg font-bold text-gray-400">No Interactive Component Selected</h3>
                      <p className="text-sm text-gray-600 mt-2">Select a Database, Cache, or Message Broker in the canvas to inspect its internals.</p>
                    </div>
                  )}
                </div>
              )}
              {activeSimulatorTab === 'CHAOS' && (
                <FailurePlayground />
              )}
              {activeSimulatorTab === 'LABS' && (
                <InteractiveSystemLabs />
              )}
            </div>
          )}
        </div>
      )}

      {/* Analysis Drawer */}
      <div className={`absolute bottom-0 ${isMobile ? 'left-0' : 'left-72'} right-0 bg-[#111113]/95 backdrop-blur-xl border-t border-[#1F1F22] shadow-2xl transition-all duration-300 z-30 ${isAnalysisOpen ? (isMobile ? 'h-full' : 'h-80') : 'h-12'}`}>
        <div 
          className="h-12 px-6 flex items-center justify-between cursor-pointer hover:bg-[#1A1A1D] transition-colors"
          onClick={() => setIsAnalysisOpen(!isAnalysisOpen)}
        >
          <div className="flex items-center gap-2 text-gray-300 font-medium text-sm">
            <Activity className="w-4 h-4 text-indigo-400" />
            Analyze Architecture
          </div>
          <button className="text-gray-500 hover:text-white">
            {isAnalysisOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
        
        {isAnalysisOpen && (
          <div className="h-[calc(100%-3rem)] flex p-6 gap-6 overflow-hidden">
            {/* Analysis Controls */}
            <div className="w-80 flex flex-col gap-4 shrink-0 border-r border-[#27272A] pr-6 overflow-y-auto custom-scrollbar">
              <div className="flex bg-[#1A1A1D] rounded-lg p-1 border border-[#27272A]">
                <button 
                  onClick={() => setAnalysisMode('VALIDATE')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${analysisMode === 'VALIDATE' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <CheckSquare className="w-3 h-3 inline mr-1" /> Validate
                </button>
                <button 
                  onClick={() => setAnalysisMode('SIMULATE')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${analysisMode === 'SIMULATE' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <Play className="w-3 h-3 inline mr-1" /> Simulate
                </button>
              </div>

              {analysisMode === 'VALIDATE' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-400 block mb-1">Problem Context (Optional)</label>
                    <input 
                      type="text"
                      value={problemContext}
                      onChange={(e) => setProblemContext(e.target.value)}
                      placeholder="e.g. Scalable Chat App"
                      className="w-full bg-[#1A1A1D] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex bg-[#1A1A1D] rounded-lg p-1 border border-[#27272A] text-[10px]">
                    <button onClick={() => setEdaMode('STANDARD')} className={`flex-1 py-1 rounded transition-colors ${edaMode === 'STANDARD' ? 'bg-zinc-700 text-white' : 'text-gray-500'}`}>Standard</button>
                    <button onClick={() => setEdaMode('KAFKA')} className={`flex-1 py-1 rounded transition-colors ${edaMode === 'KAFKA' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>EDA/Kafka</button>
                  </div>

                  {edaMode === 'STANDARD' ? (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-400 block mb-1">Traffic Volume (RPS)</label>
                        <input 
                          type="number"
                          value={trafficVolume}
                          onChange={(e) => setTrafficVolume(Number(e.target.value))}
                          className="w-full bg-[#1A1A1D] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-400 block mb-1">Fault Injection</label>
                        <select 
                          value={faultInjection}
                          onChange={(e) => setFaultInjection(e.target.value)}
                          className="w-full bg-[#1A1A1D] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="">None</option>
                          <option value="Kill Master Database">Kill DB</option>
                          <option value="Kill Kafka Broker">Kill Broker</option>
                          <option value="Cache Stampede">Cache Stampede</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        {architectureData?.id === 'enterprise-ecommerce' ? (
                          <div className="flex-1 flex gap-2">
                            <button 
                              onClick={() => setIsSimulating(!isSimulating)}
                              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                            >
                              {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />} {isSimulating ? 'Pause Engine' : 'Start Engine'}
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={publishEvent}
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                          >
                            <Send className="w-3 h-3" /> Publish Event
                          </button>
                        )}
                      </div>
                      
                      <div className="bg-[#1A1A1D] rounded-lg p-2 border border-[#27272A]">
                         <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Event Log</h4>
                         <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                            {eventLog.map(log => (
                              <div key={log.id} className="text-[10px] border-b border-[#27272A] pb-1 last:border-0">
                                <span className="text-gray-600 mr-1">[{log.time}]</span>
                                <span className={log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-gray-300'}>{log.msg}</span>
                              </div>
                            ))}
                            {eventLog.length === 0 && <div className="text-gray-600 text-center py-2 italic">No activity...</div>}
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={runAnalysis}
                disabled={isAnalyzing || nodes.length === 0}
                className="w-full mt-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 shrink-0"
              >
                {isAnalyzing ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isAnalyzing ? 'Analyzing...' : 'Run Full Analysis'}
              </button>
            </div>

            {/* Analysis Results */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 text-sm text-gray-300">
              {!analysisResult && !isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <Activity className="w-8 h-8 mb-2 opacity-20" />
                  <p>Run analysis to see feedback on your design.</p>
                </div>
              )}
              {isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-indigo-400 space-y-4">
                  <div className="flex gap-2">
                     <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                     <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <p className="animate-pulse">Analyzing system characteristics...</p>
                </div>
              )}
              {analysisResult && analysisMode === 'VALIDATE' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Validation Results</h3>
                    <div className="px-3 py-1 rounded bg-[#1A1A1D] border border-[#27272A] font-mono">Score: <span className={analysisResult.score > 70 ? 'text-emerald-400' : 'text-amber-400'}>{analysisResult.score}/100</span></div>
                  </div>
                  <div className="prose prose-invert max-w-none prose-sm">
                    <Markdown>{analysisResult.critique}</Markdown>
                  </div>
                  {analysisResult.improvements?.length > 0 && (
                    <div className="bg-[#1A1A1D] border border-[#27272A] rounded-xl p-4">
                      <h4 className="font-semibold text-white mb-2">Suggested Improvements</h4>
                      <ul className="space-y-2">
                        {analysisResult.improvements.map((imp: string, i: number) => (
                          <li key={i} className="flex gap-2 text-gray-300"><CheckSquare className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" /> <span>{imp}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {analysisResult && analysisMode === 'SIMULATE' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Simulation Results</h3>
                    <div className={`px-3 py-1 rounded border font-medium ${analysisResult.status === 'SUCCESS' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : analysisResult.status === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                       {analysisResult.status}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#1A1A1D] border border-[#27272A] p-4 rounded-xl text-center">
                      <div className="text-2xl font-mono text-white mb-1">{analysisResult.metrics?.latency_ms || 0}ms</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">P99 Latency</div>
                    </div>
                    <div className="bg-[#1A1A1D] border border-[#27272A] p-4 rounded-xl text-center">
                      <div className="text-2xl font-mono text-white mb-1">{analysisResult.metrics?.error_rate_percent || 0}%</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Error Rate</div>
                    </div>
                    <div className="bg-[#1A1A1D] border border-[#27272A] p-4 rounded-xl text-center">
                      <div className="text-2xl font-mono text-white mb-1">{analysisResult.metrics?.max_throughput || 0}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Max RPS</div>
                    </div>
                  </div>
                  <div className="bg-[#1A1A1D] border border-[#27272A] rounded-xl p-4">
                     <h4 className="font-semibold text-white mb-2">Analysis</h4>
                    <div className="prose prose-invert max-w-none prose-sm text-gray-300">
                      <Markdown>{analysisResult.analysis}</Markdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === 'INTERVIEW' && (
          <InterviewPanel nodes={nodes} edges={edges} />
        )}
        
        {/* IaC Modal */}
        <AnimatePresence>
          {showIacModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowIacModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl max-h-[85vh] bg-[#111113] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-[#27272A] bg-[#1A1A1D]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Code className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Infrastructure as Code</h3>
                      <p className="text-xs text-gray-400">Generated from your canvas architecture</p>
                    </div>
                  </div>
                  <button onClick={() => setShowIacModal(false)} className="p-2 text-gray-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-6 bg-[#0A0A0B] custom-scrollbar">
                  {isExportingIac ? (
                    <div className="h-full flex flex-col items-center justify-center text-indigo-400 space-y-4 py-12">
                      <div className="flex gap-2">
                         <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                         <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                         <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <p className="animate-pulse">Generating Infrastructure as Code...</p>
                    </div>
                  ) : iacResult?.error ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-red-400">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p>{iacResult.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {iacResult?.explanation && (
                         <div className="prose prose-invert prose-sm max-w-none text-gray-300 bg-[#1A1A1D] p-4 rounded-xl border border-[#27272A]">
                           <Markdown>{iacResult.explanation}</Markdown>
                         </div>
                      )}
                      {iacResult?.code && (
                        <div className="relative group">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(iacResult.code);
                            }}
                            className="absolute right-4 top-4 p-2 bg-[#27272A] hover:bg-gray-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs"
                          >
                            <Download className="w-3 h-3" /> Copy Code
                          </button>
                          <pre className="text-xs bg-[#1A1A1D] border border-[#27272A] p-4 rounded-xl overflow-x-auto text-gray-300 font-mono custom-scrollbar">
                            <code>{iacResult.code}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <RequirementsScratchpad onClose={() => setShowRequirementsScratchpad(false)} isOpen={showRequirementsScratchpad} />
    </div>
  );
}

export default function SystemDesignLab(props: SystemDesignLabProps) {
  return (
    <ReactFlowProvider>
      <SystemDesignLabContent {...props} />
    </ReactFlowProvider>
  );
}
