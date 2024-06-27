import JSZip from "jszip";
import { v4 as v4uuid } from "uuid";

const localStoragePrefix = "HRISY_THESIS_PROFILER_STATE";

function generateKey(key : any) {
  return `${localStoragePrefix}::${key}`;
}

function generateNamespaceKey(key : any, ns : any) {
  return `${localStoragePrefix}::namespace/${ns}::${key}`;
}

class ProfilerState {
  recordingId: string;
  innerNamespace: string;
  recordingTitle: string;
  recordingInprogress: boolean;
  recordings: any;
  globalRecordings: any;
  title!: string;
  constructor() {
    const lsNamespace = window.localStorage.getItem(generateKey("namespace"));
    if (lsNamespace == null) {
      this.innerNamespace = "default";
    } else {
      this.innerNamespace = lsNamespace;
    }
    console.log(`ProfilerState using namespace: ${this.innerNamespace}`);
    this.recordingId = "";
    this.recordingTitle = "";
    this.recordingInprogress = false;
    this.recordings = {};
    this.globalRecordings = {};
  }

  listStateKeys() {
    return Object.keys(window.localStorage).filter((x) =>
      x.includes(localStoragePrefix),
    );
  }

  listState() {
    return this.listStateKeys();
  }

  listRecordings() {
    const x = localStorageKeysToArray(
      this.listStateKeys().filter((x) => x.includes("recording/")),
    );

    const payload : any = {};

    x.forEach((data : any) => {
      const ns = data.namespace;
      if (!payload.hasOwnProperty(ns)) {
        payload[ns] = {};
      }
      payload[ns][data.title] = data;
    });

    return payload;
  }

  listGlobalRecordings() {
    return this.globalRecordings;
  }

  reset() {
    const keys = this.listStateKeys();
    keys.forEach((key) => window.localStorage.removeItem(key));
  }

  exists(key : any) {}

  namespace(title : any) {
    this.innerNamespace = title;
    window.localStorage.setItem(generateKey("namespace"), title);
  }

  record(title : any) {
    if (this.recordingInprogress) {
      console.log(
        "Recording already in progress, if you wish to start a new recording, please run .stop() first",
      );
      return;
    }

    if (title != undefined) {
      this.recordingTitle = title;
    } else {
      this.recordingTitle = v4uuid();
    }
    this.recordingId = v4uuid();
    this.recordingInprogress = true;
  }

  newRecordingEntry(data : any) {
    if (this.recordingInprogress) {
      this.recordings[v4uuid()] = data;
    } else {
      this.globalRecordings[v4uuid()] = data;
    }
  }

  downloadGlobalRecordings() {
    const payload = JSON.stringify(this.globalRecordings);
    save("global-recordings.json", payload);
  }

  downloadRecordings() {
    const zip = new JSZip();
    const recordings = this.listRecordings();
    Object.keys(recordings).forEach((namespaceKey) => {
      Object.keys(recordings[namespaceKey]).forEach((recordingKey) => {
        const fileName = `${namespaceKey}_${recordingKey}.json`;
        zip.file(
          fileName,
          JSON.stringify(recordings[namespaceKey][recordingKey]),
        );
      });
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      save("recordings.zip", content);
    });
  }

  stop() {
    const payload = {
      title: this.recordingTitle,
      data: { ...this.recordings },
      time: new Date().toISOString(),
      namespace: this.innerNamespace,
    };

    const data : any = {};
    Object.keys(this.recordings).forEach((key) => {
      const recording = this.recordings[key];
      if (!data.hasOwnProperty(recording.id)) {
        data[recording.id] = {
          renders: [],
          averageRenderTime: 0.0,
          amountOfRenders: 0,
        };
      }

      data[recording.id].renders.push(recording);
    });

    payload.data = data;

    // Generate stats
    let totalAmountOfRenders = 0;
    let totalAcc = 0.0;
    Object.keys(payload.data).forEach((key) => {
      const element = payload.data[key];
      let acc = 0.0;
      element.renders.forEach((render : any) => {
        acc = acc + render.renderTime;
      });

      // element specific
      payload.data[key].averageRenderTime = acc / element.renders.length;
      payload.data[key].amountOfRenders = element.renders.length;

      // total recording specific
      totalAmountOfRenders = totalAmountOfRenders + element.renders.length;
      totalAcc = totalAcc + acc;
    });

    (payload as any).amountOfRenders = totalAmountOfRenders;
    (payload as any).averageRenderTime = totalAcc / (payload as any).amountOfRenders;

    console.log(payload);
    this.saveState(`recording/${this.recordingId}`, payload);

    this.recordings = {};
    this.recordingId = "";
    this.title = "";
    this.recordingInprogress = false;
  }

  saveState(key : any, value : any) {
    window.localStorage.setItem(
      generateNamespaceKey(key, this.innerNamespace),
      JSON.stringify(value),
    );
  }
}

function localStorageKeysToArray(keys : any) {
  const payload : any = [];
  keys.forEach((x : any) => payload.push(JSON.parse(window.localStorage.getItem(x) as any)));
  return payload;
}

function save(filename : any, data : any) {
  const blob = new Blob([data], { type: "text/json" });
  if ((window.navigator as any).msSaveOrOpenBlob) {
    (window.navigator as any).msSaveBlob(blob, filename);
  } else {
    const elem = window.document.createElement("a");
    elem.href = (window.URL as any).createObjectURL(blob, { oneTimeOnly: true });
    elem.style.display = "none";
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
}

const GlobalProfilerState = new ProfilerState();
(window as any).globalProfilerState = GlobalProfilerState;
(window as any).gps = GlobalProfilerState;

export { ProfilerState, GlobalProfilerState };

export default GlobalProfilerState;
