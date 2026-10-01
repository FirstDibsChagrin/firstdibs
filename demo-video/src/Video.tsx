import React, { useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Backdrop, FONT } from "./components";
import {
  Afford,
  Breakdown,
  Compare,
  Intro,
  Methodology,
  Mobile,
  Outro,
  Presets,
  Problem,
  Search,
  Toolkit,
  Weights,
} from "./scenes";

const SCENES: [React.FC, number][] = [
  [Intro, 120],
  [Problem, 190],
  [Search, 240],
  [Breakdown, 190],
  [Presets, 250],
  [Weights, 250],
  [Compare, 300],
  [Afford, 310],
  [Toolkit, 230],
  [Methodology, 190],
  [Mobile, 170],
  [Outro, 180],
];

const T = 16;
export const DURATION =
  SCENES.reduce((a, [, d]) => a + d, 0) - T * (SCENES.length - 1);

let fontsLoaded: Promise<void> | null = null;
const loadFonts = () => {
  if (!fontsLoaded) {
    fontsLoaded = Promise.all(
      [400, 500, 600, 700, 800].map((w) => {
        const face = new FontFace(
          "Inter",
          `url(${staticFile(`fonts/inter-latin-${w}-normal.woff2`)}) format('woff2')`,
          { weight: String(w) },
        );
        document.fonts.add(face);
        return face.load();
      }),
    ).then(() => undefined);
  }
  return fontsLoaded;
};

export const DemoVideo: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading Inter"));
  useState(() => {
    loadFonts().then(() => continueRender(handle));
    return null;
  });
  return (
    <AbsoluteFill style={{ fontFamily: FONT, backgroundColor: "#062419" }}>
      <Backdrop />
      <TransitionSeries>
        {SCENES.flatMap(([Scene, d], i) => {
          const items = [
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={d}>
              <Scene />
            </TransitionSeries.Sequence>,
          ];
          if (i < SCENES.length - 1) {
            items.push(
              <TransitionSeries.Transition
                key={`t${i}`}
                presentation={fade()}
                timing={linearTiming({ durationInFrames: T })}
              />,
            );
          }
          return items;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
