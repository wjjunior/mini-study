import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { chartDimensionsAtom } from "../../store/atoms/uiAtoms";

const DEFAULT_WIDTH = 1000;
const DEFAULT_HEIGHT = 300;
const MOBILE_BREAKPOINT = 768;
const MOBILE_PADDING = 32;

export function useResponsiveDimensions() {
  const setChartDimensions = useSetRecoilState(chartDimensionsAtom);
  const [containerWidth, setContainerWidth] = useState<number>(DEFAULT_WIDTH);

  useEffect(() => {
    const updateDimensions = () => {
      const viewportWidth = window.innerWidth;

      if (viewportWidth < MOBILE_BREAKPOINT) {
        const availableWidth = viewportWidth - MOBILE_PADDING;
        setContainerWidth(availableWidth);
        setChartDimensions({
          width: availableWidth,
          height: DEFAULT_HEIGHT,
        });
      } else {
        setContainerWidth(DEFAULT_WIDTH);
        setChartDimensions({
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [setChartDimensions]);

  return containerWidth;
}
