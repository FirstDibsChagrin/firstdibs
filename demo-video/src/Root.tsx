import { Composition } from "remotion";
import { DemoVideo, DURATION } from "./Video";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="FirstDibsDemo"
      component={DemoVideo}
      durationInFrames={DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
