import { useMemo } from "react";
import { COLORS } from "../shared/lib/theme";
import {
  StyledSignalPlotBox,
  StyledText,
  StyledSignalTitle,
} from "../shared/ui/styled";

type MiniSignalPlotProps = {
  title: string;
  width: number;
  height: number;
  color?: string;
  values: number[];
  timestamps?: number[];
};

const MiniSignalPlot = ({
  title,
  width,
  height,
  color = COLORS.blue,
  values,
  timestamps,
}: MiniSignalPlotProps) => {
  const padding = 24;
  const innerW = Math.max(1, width - padding * 2);
  const innerH = Math.max(1, height - padding * 2);

  const { path, yMin, yMax } = useMemo(() => {
    if (!values || values.length === 0) {
      return { path: "", yMin: NaN, yMax: NaN };
    }

    const n = values.length;
    const minV = values.reduce(
      (m, v) => (v < m ? v : m),
      Number.POSITIVE_INFINITY
    );
    const maxV = values.reduce(
      (m, v) => (v > m ? v : m),
      Number.NEGATIVE_INFINITY
    );
    // Always scale from data min/max
    const domainMin = minV;
    const domainMax = maxV;
    const yRange = Math.max(1e-6, domainMax - domainMin);

    const xAt = (i: number) => {
      if (timestamps && timestamps.length === n) {
        const t0 = timestamps[0];
        const t1 = timestamps[n - 1];
        const tRange = Math.max(1e-6, t1 - t0);
        return ((timestamps[i] - t0) / tRange) * innerW;
      }
      return (i / Math.max(1, n - 1)) * innerW;
    };
    const yAt = (v: number) => {
      const rel = (v - domainMin) / yRange;
      // SVG y grows down; invert
      return innerH - rel * innerH;
    };

    let d = "";
    for (let i = 0; i < n; i++) {
      const x = xAt(i);
      const y = yAt(values[i]);
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return { path: d, yMin: domainMin, yMax: domainMax };
  }, [values, timestamps, innerW, innerH]);

  return (
    <StyledSignalPlotBox>
      <StyledSignalTitle>{title}</StyledSignalTitle>
      <StyledText.Stats>
        yMin: {Number.isFinite(yMin) ? yMin.toFixed(2) : "—"} | yMax:{" "}
        {Number.isFinite(yMax) ? yMax.toFixed(2) : "—"}
      </StyledText.Stats>
      <svg width={width} height={height}>
        <g transform={`translate(${padding}, ${padding})`}>
          <rect
            width={innerW}
            height={innerH}
            fill={COLORS.offWhite}
            stroke={COLORS.borderLightGray}
          />
          {path && (
            <path d={path} stroke={color} fill="none" strokeWidth={1.5} />
          )}
        </g>
      </svg>
    </StyledSignalPlotBox>
  );
};

export default MiniSignalPlot;
