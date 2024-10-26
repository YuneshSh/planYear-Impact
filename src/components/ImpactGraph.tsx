import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store/useStore';
import { FlowNode, FlowEdge } from '../types';

export function ImpactGraph() {
  const screens = useStore((state) => state.screens);
  const selectedFeature = useStore((state) => state.selectedFeature);
  const searchResults = useStore((state) => state.searchResults);
  const searchTerm = useStore((state) => state.searchTerm);

  const getNodesAndEdges = useCallback(() => {
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];
    let yOffset = 0;

    const hasSearchResults = searchResults.length > 0;

    screens?.forEach((screen, screenIndex) => {
      const isScreenHighlighted = searchTerm && 
        searchResults.some(result => result.screenId === screen.id);

      const screenNode: FlowNode = {
        id: `screen-${screen.id}`,
        type: 'default',
        position: { x: 250, y: yOffset },
        data: { 
          label: `Screen: ${screen.name}`, 
          screen,
          highlighted: isScreenHighlighted 
        },
        className: `text-sm font-bold ${hasSearchResults ? (isScreenHighlighted ? 'border-2 border-green-500' : 'opacity-30') : ''}`
      };
      nodes.push(screenNode);

      screen.features?.forEach((feature, featureIndex) => {
        const isFeatureHighlighted = searchTerm &&
          searchResults.some(result => 
            result.screenId === screen.id && 
            result.featureIds.includes(feature.id)
          );

        const featureNode: FlowNode = {
          id: `feature-${feature.id}`,
          type: 'default',
          position: { x: 500, y: yOffset + featureIndex * 80 },
          data: { 
            label: feature.name,
            feature,
            highlighted: isFeatureHighlighted 
          },
          className: `text-xs ${hasSearchResults ? (isFeatureHighlighted ? 'border-2 border-green-500' : 'opacity-30') : ''}`
        };
        nodes.push(featureNode);

        edges.push({
          id: `${screen.id}-${feature.id}`,
          source: `screen-${screen.id}`,
          target: `feature-${feature.id}`,
          className: hasSearchResults ? (isFeatureHighlighted ? 'stroke-green-500 stroke-2' : 'opacity-30') : undefined,
          type: 'smoothstep',
          animated: true
        });

        if (selectedFeature && feature.id === selectedFeature.id) {
          feature.connections.forEach((targetId) => {
            edges.push({
              id: `${feature.id}-${targetId}`,
              source: `feature-${feature.id}`,
              target: `feature-${targetId}`,
              className: 'stroke-indigo-500 stroke-2',
              type: 'smoothstep',
              animated: true
            });
          });
        }
      });

      yOffset += Math.max((screen.features?.length || 0) * 80, 160);
    });

    return { nodes, edges };
  }, [screens, selectedFeature, searchResults, searchTerm]);

  const { nodes: initialNodes, edges: initialEdges } = getNodesAndEdges();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getNodesAndEdges();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [screens, selectedFeature, searchResults, setNodes, setEdges, getNodesAndEdges]);

  return (
    <div className="h-[600px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}