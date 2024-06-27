import React from "react";

import { Profiler as ReactProfiler } from "react";
import profilerState from "./state";

export default function Profiler({ children, title } : {children : any, title : any}) {
  const onRender = (
    id: any,
    phase: any,
    actualDuration: any,
    baseDuration: any,
    startTime: any,
    commitTime: any,
  ) => {
    const logOutput = `title: ${id} phase: ${phase} render time: ${actualDuration}`;
    // console.log(logOutput);
    profilerState.newRecordingEntry({
      id: id,
      phase: phase,
      renderTime: actualDuration,
      time: new Date().toISOString(),
    });
  };

  const state = profilerState;

  return (
    <>
      <ReactProfiler id={title} onRender={onRender}>
        {children}
      </ReactProfiler>
    </>
  );
}
