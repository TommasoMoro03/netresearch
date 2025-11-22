// Type definitions for the Agent Reasoning Console

export interface PersonHierarchy {
    full_name: string;
    role: string;
    contact?: string;
}

export interface GraphNode {
    id: string;
    name: string;
    type: string;
    description: string;
    sources: string[];
    contacts: string[];
    hierarchy?: PersonHierarchy[];
    // Added for force-graph
    // Added for force-graph
    color?: string;
    level?: number; // 0 for user, 1 for person, 2 for lab
}

export interface GraphLink {
    source: string;
    target: string;
    label?: string;
    distance?: number; // between 0 and 1
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

// Updated StepLog interface based on user requirements
export interface StepLog {
    step_id: string;
    step_type: "intent" | "filters" | "extraction" | "exploration" | "connections" | "graph";
    message: string;
    status: "in_progress" | "done" | "pending";
    timestamp: string;
    details?: Record<string, string>;
    sources?: Array<{
        title: string;
        url: string;
        type: "paper" | "author" | "institution";
    }>;
}

export interface AgentStatusResponse {
    run_id: string;
    status: "running" | "completed" | "failed";
    progress: number; // 0-100
    steps: StepLog[];
    graph_data?: GraphData; // Optional, present when completed
}

export const mockGraphData: GraphData = {
    nodes: [
        {
            id: "user",
            name: "user",
            type: "person",
            description: "The central user node.",
            sources: [],
            contacts: [],
            color: "#ffffff",
            level: 0
        },
        {
            id: "n1",
            name: "Prof. Sarah Connor",
            type: "person",
            description: "Leading researcher in Neural Networks at Cyberdyne Systems.",
            sources: ["https://scholar.google.com/sarah_connor"],
            contacts: ["sarah.connor@cyberdyne.ai"],
            color: "#ff00ff",
            level: 1
        },
        {
            id: "n2",
            name: "Cyberdyne Systems",
            type: "lab",
            description: "Advanced AI research laboratory focusing on autonomous systems.",
            sources: ["https://cyberdyne.ai"],
            contacts: ["contact@cyberdyne.ai"],
            hierarchy: [
                { full_name: "Dr. Miles Dyson", role: "Director", contact: "miles@cyberdyne.ai" }
            ],
            color: "#00ffff",
            level: 2
        },
        {
            id: "n3",
            name: "Skynet Architecture",
            type: "lab",
            description: "Seminal paper on distributed autonomous defense networks.",
            sources: ["https://arxiv.org/abs/skynet"],
            contacts: [],
            color: "#ffff00",
            level: 2
        },
        {
            id: "n4",
            name: "T-800 Prototype",
            type: "lab",
            description: "Experimental humanoid robotics platform.",
            sources: [],
            contacts: [],
            color: "#00ff00",
            level: 3
        },
        {
            id: "n5",
            name: "Tech Noir Lab",
            type: "lab",
            description: "Research into night-time urban surveillance.",
            sources: [],
            contacts: [],
            color: "#ff0000",
            level: 1
        },
        {
            id: "n6",
            name: "Dr. Miles Dyson",
            type: "person",
            description: "Director of Special Projects at Cyberdyne.",
            sources: [],
            contacts: ["miles@cyberdyne.ai"],
            color: "#0000ff",
            level: 2
        },
        {
            id: "n7",
            name: "Project 2501",
            type: "lab",
            description: "Top secret government project.",
            sources: [],
            contacts: [],
            color: "#ff0000",
            level: 3
        },
        {
            id: "n8",
            name: "Major Motoko",
            type: "person",
            description: "Field commander for Section 9.",
            sources: [],
            contacts: [],
            color: "#00ff00",
            level: 3
        },
        {
            id: "n9",
            name: "Puppet Master",
            type: "person",
            description: "Elusive hacker entity.",
            sources: [],
            contacts: [],
            color: "#000000",
            level: 4
        },
        {
            id: "n10",
            name: "Section 9",
            type: "lab",
            description: "Public Security Section 9.",
            sources: [],
            contacts: [],
            color: "#ffffff",
            level: 2
        }
    ],
    links: [
        { source: "user", target: "n1", label: "The user is interested in the research of Prof. Sarah Connor.", distance: 0.2 },
        { source: "n1", target: "n2", label: "Prof. Sarah Connor works at Cyberdyne Systems as a leading researcher.", distance: 0.5 },
        { source: "n1", target: "n3", label: "Prof. Sarah Connor authored the seminal paper on Skynet Architecture.", distance: 0.3 },
        { source: "n2", target: "n4", label: "Cyberdyne Systems developed the T-800 Prototype.", distance: 0.8 },
        { source: "n3", target: "n4", label: "The Skynet Architecture paper describes the design of the T-800 Prototype.", distance: 0.4 },
        { source: "n5", target: "n1", label: "Tech Noir Lab collaborates with Prof. Sarah Connor on surveillance research.", distance: 0.6 },
        { source: "n2", target: "n6", label: "Dr. Miles Dyson is the Director at Cyberdyne Systems.", distance: 0.3 },
        { source: "n6", target: "n4", label: "Dr. Miles Dyson oversees the T-800 Prototype development.", distance: 0.4 },
        { source: "n1", target: "n10", label: "Prof. Sarah Connor consults for Section 9.", distance: 0.7 },
        { source: "n10", target: "n8", label: "Major Motoko leads the field operations for Section 9.", distance: 0.3 },
        { source: "n8", target: "n7", label: "Major Motoko is investigating Project 2501.", distance: 0.5 },
        { source: "n7", target: "n9", label: "Project 2501 is linked to the Puppet Master entity.", distance: 0.2 },
        { source: "n9", target: "n4", label: "The Puppet Master attempted to hack the T-800 Prototype.", distance: 0.9 }
    ]
};

// Mock data for simulation
const baseSteps: StepLog[] = [
    {
        step_id: "1",
        step_type: "intent",
        message: "Analyzing user intent...",
        status: "done",
        timestamp: new Date().toISOString(),
        details: { "Confidence": "0.98", "Intent": "Research Discovery" }
    },
    {
        step_id: "2",
        step_type: "filters",
        message: "Applying search filters...",
        status: "done",
        timestamp: new Date().toISOString(),
        details: { "Topic": "AI", "Region": "Global" }
    },
    {
        step_id: "3",
        step_type: "extraction",
        message: "Extracting entities from sources...",
        status: "in_progress",
        timestamp: new Date().toISOString(),
        sources: [
            { title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", type: "paper" },
            { title: "Yann LeCun", url: "https://scholar.google.com", type: "author" }
        ]
    },
    {
        step_id: "4",
        step_type: "connections",
        message: "Building citation network...",
        status: "pending",
        timestamp: new Date().toISOString(),
        details: { "Nodes": "15", "Edges": "42" }
    },
    {
        step_id: "5",
        step_type: "graph",
        message: "Finalizing graph visualization...",
        status: "pending",
        timestamp: new Date().toISOString()
    }
];

// Simple in-memory store for mock runs
const mockRuns: Record<string, { startTime: number }> = {};

export const getAgentStatus = async (runId: string): Promise<AgentStatusResponse> => {
    // Initialize run if not exists
    if (!mockRuns[runId]) {
        mockRuns[runId] = { startTime: Date.now() };
    }

    const elapsed = Date.now() - mockRuns[runId].startTime;

    // Simulate progression based on time
    // 0-2s: Steps 1 & 2 done, 3 in progress
    // 2-4s: Step 3 done, 4 in progress
    // 4-6s: Step 4 done, 5 in progress
    // >6s: All done, completed

    let currentSteps = [...baseSteps];
    let status: "running" | "completed" | "failed" = "running";
    let progress = 0;

    if (elapsed < 2000) {
        // Initial state
        progress = 30;
    } else if (elapsed < 4000) {
        // Advance to step 4
        currentSteps = currentSteps.map(s => {
            if (s.step_id === "3") return { ...s, status: "done" };
            if (s.step_id === "4") return { ...s, status: "in_progress" };
            return s;
        });
        progress = 60;
    } else if (elapsed < 6000) {
        // Advance to step 5
        currentSteps = currentSteps.map(s => {
            if (s.step_id === "3" || s.step_id === "4") return { ...s, status: "done" };
            if (s.step_id === "5") return { ...s, status: "in_progress" };
            return s;
        });
        progress = 90;
    } else {
        // Complete
        currentSteps = currentSteps.map(s => ({ ...s, status: "done" }));
        status = "completed";
        progress = 100;
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                run_id: runId,
                status: status,
                progress: progress,
                steps: currentSteps,
                graph_data: status === "completed" ? mockGraphData : undefined
            });
        }, 300); // Fast response
    });
};

export const getMockStatus = (runId: string): Promise<AgentStatusResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                run_id: runId,
                status: "completed",
                progress: 100,
                steps: baseSteps.map(s => ({ ...s, status: "done" })),
                graph_data: mockGraphData
            });
        }, 500);
    });
};
