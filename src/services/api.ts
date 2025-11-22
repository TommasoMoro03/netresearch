// Type definitions for the Agent Reasoning Console

export interface Contact {
    email?: string;
    website?: string;
}

export interface Paper {
    title: string;
    link?: string;
    abstract?: string;
    publication_year?: number;
    topic?: string;
}

export interface GraphNode {
    id: string;
    name: string;
    type: string; // "professor", "laboratory"
    institution?: string;
    description: string;
    contacts: Contact;
    works_count?: number;
    cited_by_count?: number;
    h_index?: number;
    link_orcid?: string;
    papers?: Paper[];
    // Added for force-graph
    color?: string;
    level?: number; // 0 for user, 1 for professor, 2 for laboratory
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
            type: "person", // Keeping as person for user node, or maybe "user"? Let's stick to "person" for now or "user" if distinct. The user said "professor" or "laboratory". Let's use "professor" for people-like things or maybe a special type. The prompt said "The node type is only person or lab" previously, now "professor", "laboratory". I'll use "professor" for people and "laboratory" for labs. For the user node, I'll keep it as "user" or "professor" but with level 0. Let's use "professor" for consistency or maybe just "user" and handle it. Actually, the user node is special. I'll keep type "person" for user to distinguish, or map it to "professor". Let's use "professor" for user to be safe with types, but maybe "user" is better. I'll use "professor" for now but name it "user".
            description: "The central user node.",
            contacts: {},
            color: "#e0f2f1",
            level: 0
        },
        {
            id: "n1",
            name: "Prof. Sarah Connor",
            type: "professor",
            institution: "Cyberdyne Systems",
            description: "Leading researcher in Neural Networks.",
            contacts: { email: "sarah.connor@cyberdyne.ai", website: "https://scholar.google.com/sarah_connor" },
            works_count: 42,
            cited_by_count: 1337,
            h_index: 25,
            papers: [
                {
                    title: "Neural Networks for Time Travel",
                    publication_year: 2029,
                    link: "https://arxiv.org/abs/time-travel",
                    topic: "Temporal Mechanics",
                    abstract: "This paper explores the theoretical possibility of using advanced neural networks to calculate temporal displacement vectors. We propose a novel architecture capable of predicting and compensating for the chaotic nature of time travel, ensuring safe arrival at the target destination."
                },
                {
                    title: "twinsnvfs",
                    publication_year: 2029,
                    link: "https://arxiv.org/abs/time-travel",
                    topic: "Quantum Computing",
                    abstract: "A study on the effects of quantum entanglement on twin paradox scenarios in non-volatile file systems."
                }
            ],
            color: "#14b8a6",
            level: 1
        },
        {
            id: "n2",
            name: "Cyberdyne Systems",
            type: "laboratory",
            description: "Advanced AI research laboratory.",
            contacts: { email: "contact@cyberdyne.ai", website: "https://cyberdyne.ai" },
            color: "#0ea5e9",
            level: 2
        },
        {
            id: "n3",
            name: "Skynet Architecture",
            type: "laboratory", // Representing paper/project as lab for now or maybe just a node. The user said "professor" or "laboratory". I'll stick to that.
            description: "Seminal paper on distributed autonomous defense networks.",
            contacts: {},
            color: "#06b6d4",
            level: 2
        },
        {
            id: "n4",
            name: "T-800 Prototype",
            type: "laboratory",
            description: "Experimental humanoid robotics platform.",
            contacts: {},
            color: "#22d3ee",
            level: 3
        },
        {
            id: "n5",
            name: "Tech Noir Lab",
            type: "laboratory",
            description: "Research into night-time urban surveillance.",
            contacts: {},
            color: "#38bdf8",
            level: 1
        },
        {
            id: "n6",
            name: "Dr. Miles Dyson",
            type: "professor",
            institution: "Cyberdyne Systems",
            description: "Director of Special Projects.",
            contacts: { email: "miles@cyberdyne.ai" },
            works_count: 15,
            cited_by_count: 500,
            h_index: 12,
            color: "#0ea5e9",
            level: 2
        },
        {
            id: "n7",
            name: "Project 2501",
            type: "laboratory",
            description: "Top secret government project.",
            contacts: {},
            color: "#f43f5e",
            level: 3
        },
        {
            id: "n8",
            name: "Major Motoko",
            type: "professor",
            institution: "Section 9",
            description: "Field commander.",
            contacts: {},
            color: "#14b8a6",
            level: 3
        },
        {
            id: "n9",
            name: "Puppet Master",
            type: "professor",
            description: "Elusive hacker entity.",
            contacts: {},
            color: "#0f172a",
            level: 4
        },
        {
            id: "n10",
            name: "Section 9",
            type: "laboratory",
            description: "Public Security Section 9.",
            contacts: {},
            color: "#e0f2f1",
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
