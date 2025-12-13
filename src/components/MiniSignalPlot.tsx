import { useMemo, useRef, useEffect, useState } from "react";
import { COLORS } from "../shared/lib/theme";
import {
  StyledSignalPlotBox,
  StyledText,
  StyledSignalTitle,
  StyledCanvasContainer,
  StyledCanvas,
  StyledResponsiveSvg,
} from "../shared/ui/styled";
import {
  downsampleSignal,
  calculateOptimalSampleCount,
} from "../shared/lib/utils";

type MiniSignalPlotProps = {
  title: string;
  width: number;
  height: number;
  color?: string;
  values: number[];
  timestamps?: number[];
};

const SVG_THRESHOLD = 1000;
const PADDING = 24;

const MiniSignalPlot = ({
  title,
  width,
  height,
  color = COLORS.blue,
  values,
  timestamps,
}: MiniSignalPlotProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(width);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width || width);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, [width]);

  const actualWidth = containerWidth;
  const innerW = Math.max(1, actualWidth - PADDING * 2);
  const innerH = Math.max(1, height - PADDING * 2);

  const { processedData, yMin, yMax, useCanvas } = useMemo(() => {
    if (!values || values.length === 0) {
      return {
        processedData: { values: [], timestamps: undefined },
        yMin: NaN,
        yMax: NaN,
        useCanvas: false,
      };
    }

    const optimalCount = calculateOptimalSampleCount(innerW);
    const shouldDownsample = values.length > optimalCount;
    const useCanvas = values.length >= SVG_THRESHOLD;

    const processed = shouldDownsample
      ? downsampleSignal(values, timestamps, optimalCount)
      : { values, timestamps };

    const minV = processed.values.reduce(
      (m, v) => (v < m ? v : m),
      Number.POSITIVE_INFINITY
    );
    const maxV = processed.values.reduce(
      (m, v) => (v > m ? v : m),
      Number.NEGATIVE_INFINITY
    );

    return {
      processedData: processed,
      yMin: minV,
      yMax: maxV,
      useCanvas,
    };
  }, [values, timestamps, innerW]);

  const svgPath = useMemo(() => {
    if (useCanvas || !processedData.values.length) return "";

    const { values: v, timestamps: ts } = processedData;
    const n = v.length;
    const yRange = Math.max(1e-6, yMax - yMin);

    const xAt = (i: number) => {
      if (ts && ts.length === n) {
        const t0 = ts[0];
        const t1 = ts[n - 1];
        const tRange = Math.max(1e-6, t1 - t0);
        return ((ts[i] - t0) / tRange) * innerW;
      }
      return (i / Math.max(1, n - 1)) * innerW;
    };

    const yAt = (val: number) => {
      const rel = (val - yMin) / yRange;
      return innerH - rel * innerH;
    };

    let d = "";
    for (let i = 0; i < n; i++) {
      const x = xAt(i);
      const y = yAt(v[i]);
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return d;
  }, [processedData, yMin, yMax, innerW, innerH, useCanvas]);

  useEffect(() => {
    if (!useCanvas || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { values: v, timestamps: ts } = processedData;
    const n = v.length;
    if (n === 0) return;

    ctx.clearRect(0, 0, innerW, innerH);

    ctx.fillStyle = COLORS.offWhite;
    ctx.fillRect(0, 0, innerW, innerH);

    ctx.strokeStyle = COLORS.borderLightGray;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, innerW, innerH);

    const canvasYRange = Math.max(1e-6, yMax - yMin);

    const xAt = (i: number) => {
      if (ts && ts.length === n) {
        const t0 = ts[0];
        const t1 = ts[n - 1];
        const tRange = Math.max(1e-6, t1 - t0);
        return ((ts[i] - t0) / tRange) * innerW;
      }
      return (i / Math.max(1, n - 1)) * innerW;
    };

    const yAt = (val: number) => {
      const rel = (val - yMin) / canvasYRange;
      return innerH - rel * innerH;
    };

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    for (let i = 0; i < n; i++) {
      const x = xAt(i);
      const y = yAt(v[i]);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }, [processedData, yMin, yMax, innerW, innerH, color, useCanvas]);

  return (
    <StyledSignalPlotBox>
      <StyledSignalTitle>{title}</StyledSignalTitle>
      <StyledText.Stats>
        yMin: {Number.isFinite(yMin) ? yMin.toFixed(2) : "—"} | yMax:{" "}
        {Number.isFinite(yMax) ? yMax.toFixed(2) : "—"}
        {processedData.values.length < values.length && (
          <>
            {" "}
            | Points: {processedData.values.length}/{values.length}
          </>
        )}
      </StyledText.Stats>
      {useCanvas ? (
        <StyledCanvasContainer ref={containerRef} height={height}>
          <StyledCanvas ref={canvasRef} width={innerW} height={innerH} />
        </StyledCanvasContainer>
      ) : (
        <StyledResponsiveSvg
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform={`translate(${PADDING}, ${PADDING})`}>
            <rect
              width={innerW}
              height={innerH}
              fill={COLORS.offWhite}
              stroke={COLORS.borderLightGray}
            />
            {svgPath && (
              <path d={svgPath} stroke={color} fill="none" strokeWidth={1.5} />
            )}
          </g>
        </StyledResponsiveSvg>
      )}
    </StyledSignalPlotBox>
  );
};

export default MiniSignalPlot;
