import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import ForceGraph3D from 'react-force-graph-3d';
import { GraphData, GraphNode, GraphLink } from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

    // Auto-rotate and Zoom sensitivity
    useEffect(() => {
        if (fgRef.current) {
            const controls = fgRef.current.controls();
            if (controls) {
                controls.zoomSpeed = 1; // Adjusted zoom sensitivity
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
        setSelectedNode(node as GraphNode);
        setIsDialogOpen(true);

        // Aim at node from outside it
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        fgRef.current.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
            node, // lookAt ({ x, y, z })
            3000  // ms transition duration
        );
    };

    const getNodeColor = (node: GraphNode) => {
        return node.color || '#ffffff';
    };

    const getNodeIcon = (type: string) => {
        switch (type) {
            case 'person': return <User className="w-4 h-4" />;
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
                nodeVal="val"
                onNodeClick={handleNodeClick}
                onNodeDrag={handleNodeDrag}
                onLinkClick={handleLinkClick}
                backgroundColor="#00000000" // Transparent background to let the parent gradient show
                showNavInfo={false}
                nodeThreeObjectExtend={false}
                nodeThreeObject={(node: any) => {
                    const group = new THREE.Group();

                    // Determine size based on type
                    const size = node.type === 'person' ? 4 : 8;
                    const color = node.color || '#ffffff';

                    // Sphere
                    const geometry = new THREE.SphereGeometry(size, 64, 64);
                    const material = new THREE.MeshLambertMaterial({
                        color: color,
                        transparent: true,
                        opacity: 0.9
                    });
                    const sphere = new THREE.Mesh(geometry, material);
                    group.add(sphere);

                    // Label
                    const sprite = new SpriteText(node.name);
                    sprite.color = '#ffffff';
                    sprite.textHeight = 2;
                    sprite.position.y = size + 2;
                    sprite.backgroundColor = '#00000080';
                    sprite.padding = 1;
                    sprite.borderRadius = 10; // Ensure fully rounded pill shape

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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-primary/20">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-display text-primary">
                            {selectedNode && getNodeIcon(selectedNode.type)}
                            {selectedNode?.name}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {selectedNode?.type.charAt(0).toUpperCase() + selectedNode?.type.slice(1)}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedNode && (
                        <ScrollArea className="max-h-[60vh] pr-4">
                            <div className="space-y-6 py-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-foreground">Description</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {selectedNode.description}
                                    </p>
                                </div>

                                {selectedNode.hierarchy && selectedNode.hierarchy.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-foreground">Key People</h4>
                                        <div className="grid gap-2">
                                            {selectedNode.hierarchy.map((person, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border/50">
                                                    <div>
                                                        <p className="text-sm font-medium">{person.full_name}</p>
                                                        <p className="text-xs text-muted-foreground">{person.role}</p>
                                                    </div>
                                                    {person.contact && (
                                                        <a href={`mailto:${person.contact}`} className="text-primary hover:text-primary/80">
                                                            <Mail className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedNode.contacts && selectedNode.contacts.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-foreground">Contact & Links</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedNode.contacts.map((contact, idx) => (
                                                <Badge key={idx} variant="outline" className="gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {contact}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedNode.sources && selectedNode.sources.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-foreground">Sources</h4>
                                        <div className="flex flex-col gap-2">
                                            {selectedNode.sources.map((source, idx) => (
                                                <a
                                                    key={idx}
                                                    href={source}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-xs text-primary hover:underline truncate"
                                                >
                                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                    {source}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </DialogContent>
            </Dialog>

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
        </div>
    );
};

export default GraphVisualization;
