import "./index.css";
import { Composition } from "remotion";
import { AIRadarPromo } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AIRadarPromo"
      component={AIRadarPromo}
      durationInFrames={3600}
      fps={30}
      width={1280}
      height={720}
    />
  );
};