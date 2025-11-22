import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import ForceGraph3D from 'react-force-graph-3d';
import { GraphData, GraphNode, GraphLink } from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Mail, Building, User, FileText, Network } from 'lucide-react';
import SpriteText from 'three-spritetext';

interface GraphVisualizationProps {
    data: GraphData;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ data }) => {
    const fgRef = useRef<any>();
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

    // Auto-rotate and Zoom sensitivity
    useEffect(() => {
        if (fgRef.current) {
            const controls = fgRef.current.controls();
            if (controls) {
                controls.zoomSpeed = 3; // Adjusted zoom sensitivity
                controls.enableDamping = true;
                controls.dampingFactor = 0.1;
            }

            // Apply distance metric to link forces
            fgRef.current.d3Force('link').distance((link: any) => {
                // Map distance (0-1) to visual range (10-100) - Shorter edges
                const dist = link.distance !== undefined ? link.distance : 0.5;
                return 10 + dist * 90;
            });
        }
    }, []);

    // Center user node
    useEffect(() => {
        // Find user node and fix it to center
        const userNode = data.nodes.find(n => n.name === 'user');
        if (userNode) {
            const node = userNode as any;
            node.fx = 0;
            node.fy = 0;
            node.fz = 0;
        }
    }, [data]);

    const handleNodeDrag = (node: any) => {
        // Prevent dragging the user node
        if (node.name === 'user') {
            node.fx = 0;
            node.fy = 0;
            node.fz = 0;
            node.x = 0;
            node.y = 0;
            node.z = 0;
        }
    };

    const handleLinkClick = (link: any) => {
        setSelectedLink(link as GraphLink);
        setIsLinkDialogOpen(true);
    };

    const handleNodeClick = (node: any) => {
        // Prevent clicking the user node
        if (node.id === 'user') return;

        setSelectedNode(node as GraphNode);
        setIsSheetOpen(true);

        // Aim at node from outside it
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        fgRef.current.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
            node, // lookAt ({ x, y, z })
            3000  // ms transition duration
        );
    };

    // Reset view when sheet is closed
    useEffect(() => {
        if (!isSheetOpen && fgRef.current) {
            // Reset to initial view
            fgRef.current.cameraPosition(
                { x: 0, y: 0, z: 200 }, // Initial position (approximate)
                { x: 0, y: 0, z: 0 },   // Look at center
                2000                    // Transition duration
            );
        }
    }, [isSheetOpen]);

    const getNodeColor = (node: GraphNode) => {
        if (node.level === 0) return '#808080'; // Gray for user

        const level = node.level || 1;
        const lightness = 40 + (level - 1) * 10; // Base 40%, +10% per level
        const l = Math.min(lightness, 90); // Cap at 90%

        if (node.type === 'professor' || node.type === 'person') {
            return `hsl(210, 40%, ${l}%)`; // Sober Blue
        } else if (node.type === 'laboratory' || node.type === 'lab') {
            return `hsl(160, 40%, ${l}%)`; // Sober Teal
        }
        return node.color || '#ffffff';
    };

    const getNodeIcon = (type: string) => {
        switch (type) {
            case 'professor':
            case 'person': return <User className="w-4 h-4" />;
            case 'laboratory':
            case 'lab': return <Building className="w-4 h-4" />;
            case 'paper': return <FileText className="w-4 h-4" />;
            default: return <Network className="w-4 h-4" />;
        }
    };

    return (
        <div className="w-full h-full relative">
            <ForceGraph3D
                ref={fgRef}
                graphData={data}
                nodeLabel="name"
                nodeColor={node => getNodeColor(node as GraphNode)}
                onNodeClick={handleNodeClick}
                onNodeDrag={handleNodeDrag}
                onLinkClick={handleLinkClick}
                backgroundColor="#00000000" // Transparent background to let the parent gradient show
                showNavInfo={false}
                nodeThreeObjectExtend={false}
                nodeThreeObject={(node: any) => {
                    const group = new THREE.Group();

                    // Determine size based on type
                    const size = node.type === 'professor' || node.type === 'person' ? 4 : 8;
                    const color = getNodeColor(node as GraphNode);

                    // Outer glass sphere with enhanced realism
                    const geometry = new THREE.SphereGeometry(size, 128, 128);
                    const material = new THREE.MeshPhysicalMaterial({
                        color: color,
                        transparent: true,
                        opacity: 0.85,
                        transmission: 0.4,      // More glass transmission
                        roughness: 0.05,        // Very smooth for glass
                        metalness: 0.0,         // No metalness for pure glass
                        clearcoat: 1.0,         // Strong clear coat
                        clearcoatRoughness: 0.05,
                        ior: 1.5,               // Index of refraction for glass
                        thickness: 0.5,         // Glass thickness
                        envMapIntensity: 1.5,   // Environment reflection
                        emissive: color,        // Subtle inner glow
                        emissiveIntensity: 0.15 // Low intensity glow
                    });
                    const sphere = new THREE.Mesh(geometry, material);
                    group.add(sphere);

                    // Inner core for depth and realism
                    const coreGeometry = new THREE.SphereGeometry(size * 0.5, 32, 32);
                    const coreMaterial = new THREE.MeshPhysicalMaterial({
                        color: color,
                        emissive: color,
                        emissiveIntensity: 0.6,
                        transparent: true,
                        opacity: 0.4,
                        roughness: 0.2,
                        metalness: 0.3
                    });
                    const core = new THREE.Mesh(coreGeometry, coreMaterial);
                    group.add(core);

                    // Label
                    const sprite = new SpriteText(node.name);
                    sprite.color = '#ffffff';
                    sprite.textHeight = 2;
                    sprite.position.y = size + 2;

                    // Add stroke for visibility without background box
                    sprite.strokeColor = '#000000';
                    sprite.strokeWidth = 1;

                    // sprite.backgroundColor = '#00000080'; // Removed background shadow
                    sprite.padding = 1;
                    // sprite.borderRadius = 10; // No longer needed without background

                    // Ensure text is always visible on top
                    sprite.renderOrder = 999;
                    sprite.material.depthTest = false;
                    sprite.material.depthWrite = false;

                    group.add(sprite);

                    return group;
                }}
                linkColor={() => '#ffffff50'}
                linkWidth={1}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
            />

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent
                    side="right"
                    className="w-[400px] sm:w-[540px] bg-background/95 backdrop-blur-xl border-l border-primary/20 overflow-visible"
                >
                    <div className="h-full overflow-y-auto pr-2">
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2 text-xl font-display text-primary">
                                {selectedNode && getNodeIcon(selectedNode.type)}
                                {selectedNode?.name}
                            </SheetTitle>
                            <SheetDescription className="text-muted-foreground">
                                {selectedNode?.type === 'professor' ? 'Professor' : selectedNode?.type === 'laboratory' ? 'Laboratory' : 'Person'}
                                {selectedNode?.institution && ` • ${selectedNode.institution}`}
                            </SheetDescription>
                        </SheetHeader>

                        {selectedNode && (
                            <div className="mt-6">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-foreground">Description</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {selectedNode.description}
                                        </p>
                                    </div>

                                    {/* Stats Section */}
                                    {(selectedNode.works_count !== undefined || selectedNode.cited_by_count !== undefined || selectedNode.h_index !== undefined) && (
                                        <div className="grid grid-cols-3 gap-4 py-4 border-y border-border/50">
                                            {selectedNode.works_count !== undefined && (
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-primary">{selectedNode.works_count}</div>
                                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Works</div>
                                                </div>
                                            )}
                                            {selectedNode.cited_by_count !== undefined && (
                                                <div className="text-center border-l border-border/50">
                                                    <div className="text-2xl font-bold text-primary">{selectedNode.cited_by_count}</div>
                                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Citations</div>
                                                </div>
                                            )}
                                            {selectedNode.h_index !== undefined && (
                                                <div className="text-center border-l border-border/50">
                                                    <div className="text-2xl font-bold text-primary">{selectedNode.h_index}</div>
                                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">H-Index</div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Contacts */}
                                    {(selectedNode.contacts?.email || selectedNode.contacts?.website || selectedNode.link_orcid) && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium text-foreground">Contact & Links</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedNode.contacts?.email && (
                                                    <a href={`mailto:${selectedNode.contacts.email}`} className="no-underline">
                                                        <Badge variant="outline" className="gap-1 hover:bg-primary/10 transition-colors cursor-pointer">
                                                            <Mail className="w-3 h-3" />
                                                            {selectedNode.contacts.email}
                                                        </Badge>
                                                    </a>
                                                )}
                                                {selectedNode.contacts?.website && (
                                                    <a href={selectedNode.contacts.website} target="_blank" rel="noopener noreferrer" className="no-underline">
                                                        <Badge variant="outline" className="gap-1 hover:bg-primary/10 transition-colors cursor-pointer">
                                                            <ExternalLink className="w-3 h-3" />
                                                            Website
                                                        </Badge>
                                                    </a>
                                                )}
                                                {selectedNode.link_orcid && (
                                                    <a href={selectedNode.link_orcid} target="_blank" rel="noopener noreferrer" className="no-underline">
                                                        <Badge variant="outline" className="gap-1 hover:bg-primary/10 transition-colors cursor-pointer">
                                                            <span className="font-bold text-[10px]">iD</span>
                                                            ORCID
                                                        </Badge>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Papers */}
                                    {selectedNode.papers && selectedNode.papers.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium text-foreground">Papers & Publications</h4>
                                            <div className="flex flex-col gap-2">
                                                {selectedNode.papers.map((paper, idx) => (
                                                    <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <h5 className="text-sm font-medium text-foreground leading-snug">{paper.title}</h5>
                                                            {paper.publication_year && (
                                                                <span className="text-xs text-muted-foreground whitespace-nowrap px-1.5 py-0.5 rounded bg-background border border-border/50">
                                                                    {paper.publication_year}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {paper.topic && (
                                                            <p className="text-xs text-primary mt-1">{paper.topic}</p>
                                                        )}
                                                        {paper.abstract && (
                                                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                                {paper.abstract}
                                                            </p>
                                                        )}
                                                        {paper.link && (
                                                            <a
                                                                href={paper.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                                                            >
                                                                View Paper <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                <DialogContent className="sm:max-w-[400px] bg-background/95 backdrop-blur-xl border-primary/20">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-display text-primary">
                            <Network className="w-5 h-5" />
                            Relationship
                        </DialogTitle>
                    </DialogHeader>
                    {selectedLink && (
                        <div className="py-4">
                            <p className="text-lg font-medium text-foreground leading-relaxed">
                                {selectedLink.label || 'Unknown relationship'}
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default GraphVisualization;
