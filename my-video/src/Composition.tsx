import {
  useCurrentFrame,
  interpolate,
  Easing,
  useVideoConfig,
  AbsoluteFill,
  Sequence,
} from "remotion";

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const titleScale = interpolate(frame, [0, 20], [0.9, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const subtitleOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <Sequence name="Title">
        <div
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            color: "#ffffff",
            fontSize: 80,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          AI Radar
        </div>
      </Sequence>
      <Sequence name="Subtitle" from={25}>
        <div
          style={{
            opacity: subtitleOpacity,
            color: "#888888",
            fontSize: 36,
            marginTop: 24,
            fontWeight: 400,
          }}
        >
          Weekly Intelligence Digest
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};