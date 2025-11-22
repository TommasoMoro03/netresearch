// Removed incorrect import 
// Actually Literal is likely from typescript or a library like zod or just a type. 
// The user request showed: status: Literal["running", "completed"]
// This implies it's a type. I'll use a type alias or just string for now if I can't find the import.
// Wait, `Literal` is a python thing from `typing`. In TS it's just a union type.
// I will translate the python models to TS interfaces.

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
    val?: number;
    color?: string;
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
    id: number;
    step: string;
    message: string;
    sources: { name: string; url: string; }[];
    timestamp: Date;
}

export interface AgentStatusResponse {
    run_id: string;
    status: "running" | "completed";
    steps: StepLog[];
    graph_data?: GraphData;
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
            val: 30,
            color: "#ffffff"
        },
        {
            id: "n1",
            name: "Prof. Sarah Connor",
            type: "person",
            description: "Leading researcher in Neural Networks at Cyberdyne Systems.",
            sources: ["https://scholar.google.com/sarah_connor"],
            contacts: ["sarah.connor@cyberdyne.ai"],
            val: 20,
            color: "#ff00ff"
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
            val: 30,
            color: "#00ffff"
        },
        {
            id: "n3",
            name: "Skynet Architecture",
            type: "lab", // Changed to lab as per request for only person/lab types, or maybe it should be a paper? User said "The node type is only person or lab". I'll stick to that.
            description: "Seminal paper on distributed autonomous defense networks.",
            sources: ["https://arxiv.org/abs/skynet"],
            contacts: [],
            val: 10,
            color: "#ffff00"
        },
        {
            id: "n4",
            name: "T-800 Prototype",
            type: "lab", // Assuming project -> lab for now to satisfy "only person or lab"
            description: "Experimental humanoid robotics platform.",
            sources: [],
            contacts: [],
            val: 15,
            color: "#00ff00"
        },
        {
            id: "n5",
            name: "Tech Noir Lab",
            type: "lab",
            description: "Research into night-time urban surveillance.",
            sources: [],
            contacts: [],
            val: 25,
            color: "#ff0000"
        }
    ],
    links: [
        { source: "user", target: "n1", label: "The user is interested in the research of Prof. Sarah Connor.", distance: 0.2 },
        { source: "n1", target: "n2", label: "Prof. Sarah Connor works at Cyberdyne Systems as a leading researcher.", distance: 0.5 },
        { source: "n1", target: "n3", label: "Prof. Sarah Connor authored the seminal paper on Skynet Architecture.", distance: 0.3 },
        { source: "n2", target: "n4", label: "Cyberdyne Systems developed the T-800 Prototype.", distance: 0.8 },
        { source: "n3", target: "n4", label: "The Skynet Architecture paper describes the design of the T-800 Prototype.", distance: 0.4 },
        { source: "n5", target: "n1", label: "Tech Noir Lab collaborates with Prof. Sarah Connor on surveillance research.", distance: 0.6 }
    ]
};

export const getMockStatus = (runId: string): Promise<AgentStatusResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                run_id: runId,
                status: "completed",
                steps: [], // We can populate this if needed, but the graph is the focus
                graph_data: mockGraphData
            });
        }, 500);
    });
};
