import { useRef, useCallback, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { GraphData } from "../types/api";

interface CharacterGraphProps {
  graphData: GraphData;
}

const COLORS = {
  positive: "rgba(76, 175, 80, 0.8)",
  negative: "rgba(244, 67, 54, 0.8)",
  neutral: "rgba(158, 158, 158, 0.8)",
};

export function CharacterGraph({ graphData }: CharacterGraphProps) {
  const fgRef = useRef<any>(null);

  const handleNodeClick = useCallback((node: any) => {
    fgRef.current.centerAt(node.x, node.y, 1000);
    fgRef.current.zoom(2.5, 1000);
  }, []);

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      setTimeout(() => {
        fgRef.current.zoomToFit(100, 90);
      }, 100);
    }
  }, [graphData]);

  return (
    <div
      style={{
        width: "100%",
        height: "60vh",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderRadius: "8px",
          padding: "12px",
          color: "white",
          fontSize: "12px",
          zIndex: 1000,
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
          Relationship Sentiment
        </div>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}
        >
          <div
            style={{
              width: "20px",
              height: "3px",
              backgroundColor: COLORS.positive,
              marginRight: "8px",
            }}
          />
          <span>Positive</span>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}
        >
          <div
            style={{
              width: "20px",
              height: "3px",
              backgroundColor: COLORS.negative,
              marginRight: "8px",
            }}
          />
          <span>Negative</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "20px",
              height: "3px",
              backgroundColor: COLORS.neutral,
              marginRight: "8px",
            }}
          />
          <span>Neutral</span>
        </div>
      </div>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeAutoColorBy="group"
        nodeCanvasObject={(node, ctx) => {
          const label = node.id;
          const fontSize = 8;
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;

          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";

          ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
          ctx.lineWidth = 1;

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.fillText(label, node.x, node.y);
        }}
        linkCanvasObject={(link, ctx) => {
          const width = link.value;
          ctx.lineWidth = width;

          if (link.sentiment === "positive") {
            ctx.strokeStyle = COLORS.positive;
          } else if (link.sentiment === "negative") {
            ctx.strokeStyle = COLORS.negative;
          } else {
            ctx.strokeStyle = COLORS.neutral;
          }

          ctx.beginPath();
          ctx.moveTo(link.source.x, link.source.y);
          ctx.lineTo(link.target.x, link.target.y);
          ctx.stroke();
        }}
        onNodeClick={handleNodeClick}
        backgroundColor="rgba(0, 0, 0, 0)"
        linkColor={(link) => {
          if (link.sentiment === "positive") {
            return COLORS.positive;
          } else if (link.sentiment === "negative") {
            return COLORS.negative;
          } else {
            return COLORS.neutral;
          }
        }}
        nodeVal="val"
        width={600}
        height={600}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
}
