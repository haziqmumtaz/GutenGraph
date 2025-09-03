import { useRef, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { GraphData } from "../types/api";

interface CharacterGraphProps {
  graphData: GraphData;
}

export function CharacterGraph({ graphData }: CharacterGraphProps) {
  const fgRef = useRef<any>(null);

  const handleNodeClick = useCallback((node: any) => {
    fgRef.current.centerAt(node.x, node.y, 1000);
    fgRef.current.zoom(2.5, 1000);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "500px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeAutoColorBy="group"
        nodeCanvasObject={(node, ctx) => {
          const label = node.id;
          const fontSize = 8;
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;

          ctx.fillStyle = "rgba(0, 0, 0, 0.85)";

          ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
          ctx.lineWidth = 1;

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
          ctx.fillText(label, node.x, node.y);
        }}
        linkCanvasObject={(link, ctx) => {
          const width = link.value;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(link.source.x, link.source.y);
          ctx.lineTo(link.target.x, link.target.y);
          ctx.stroke();
        }}
        onNodeClick={handleNodeClick}
        backgroundColor="rgba(0, 0, 0, 0)"
        linkColor={(link) => {
          const intensity = link.value / 6; // Normalize to 0-1 based on max value
          return `rgba(255, 255, 255, ${0.2 + intensity * 0.8})`; // 0.2 to 1.0 opacity
        }}
        linkWidth={(link) => Math.max(1, link.value * 2)} // Scale based on max value of 6
        nodeVal="val"
      />
    </div>
  );
}
