const formatNumber = (value, digits = 2) =>
  Number.isFinite(value) && value > 0 ? value.toFixed(digits) : "--";

const formatTime = (minutes) => {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "--";
  }
  const totalSeconds = Math.round(minutes * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
};

const comparisonProfiles = [
  { name: "You", speedMps: 0, color: "#0a84ff" },
  { name: "Usain Bolt", speedMps: 10.44, color: "#ff9f0a" },
  { name: "Fighter jet", speedMps: 444, color: "#ff375f" },
  { name: "Hummingbird", speedMps: 13.9, color: "#34c759" },
];

const chartMetrics = [
  {
    key: "kmPerMin",
    label: "km/min",
    value: (speedMps) => (speedMps > 0 ? (speedMps * 60) / 1000 : 0),
    format: (value) => `${value.toFixed(2)} km/min`,
  },
  {
    key: "mPerMin",
    label: "m/min",
    value: (speedMps) => (speedMps > 0 ? speedMps * 60 : 0),
    format: (value) => `${Math.round(value)} m/min`,
  },
  {
    key: "mPerSec",
    label: "m/s",
    value: (speedMps) => (speedMps > 0 ? speedMps : 0),
    format: (value) => `${value.toFixed(2)} m/s`,
  },
  {
    key: "minPerKm",
    label: "min/km",
    value: (speedMps) => (speedMps > 0 ? (1000 / speedMps) / 60 : 0),
    format: (value) => `${value.toFixed(2)} min/km`,
  },
];

const attachChartListener = () => {
  if (document.documentElement.dataset.chartListenerAttached) {
    return;
  }
  document.addEventListener("click", (event) => {
    const row = event.target.closest(".bar-row");
    if (row && row.closest(".chart-bars")) {
      row.classList.toggle("is-active");
    }
  });
  document.documentElement.dataset.chartListenerAttached = "true";
};

const renderCharts = (comparisons) => {
  attachChartListener();
  chartMetrics.forEach((metric) => {
    const bars = document.querySelector(`[data-bars="${metric.key}"]`);
    const scale = document.querySelector(`[data-scale="${metric.key}"]`);
    if (!bars || !scale) {
      return;
    }

    const values = comparisons.map((profile) => metric.value(profile.speedMps));
    const max = Math.max(...values, 0.01);
    scale.textContent = metric.format(max);

    const fragment = document.createDocumentFragment();
    comparisons.forEach((profile) => {
      const value = metric.value(profile.speedMps);
      const width = Math.min((value / max) * 100, 100);
      const row = document.createElement("div");
      row.className = "bar-row";
      row.style.setProperty("--bar-color", profile.color);
      const meta = document.createElement("div");
      meta.className = "bar-meta";
      const name = document.createElement("span");
      name.textContent = profile.name;
      const valueLabel = document.createElement("span");
      valueLabel.textContent = metric.format(value);
      meta.append(name, valueLabel);

      const track = document.createElement("div");
      track.className = "bar-track";
      const fill = document.createElement("span");
      fill.className = "bar-fill";
      fill.style.width = `${width.toFixed(1)}%`;
      track.appendChild(fill);

      row.append(meta, track);
      fragment.appendChild(row);
    });
    bars.innerHTML = "";
    bars.appendChild(fragment);
  });
};

const updateCalculator = () => {
  const distanceInput = document.getElementById("distance");
  const timeMinInput = document.getElementById("time-min");
  const timeSecInput = document.getElementById("time-sec");
  const paceInput = document.getElementById("pace");
  const stepsInput = document.getElementById("steps");

  if (!distanceInput || !timeMinInput || !timeSecInput || !paceInput || !stepsInput) {
    return;
  }

  const distanceKm = parseFloat(distanceInput.value);
  const minutes = parseFloat(timeMinInput.value);
  const seconds = parseFloat(timeSecInput.value);
  const paceInputValue = parseFloat(paceInput.value);
  const steps = parseFloat(stepsInput.value);

  let timeMinutes = (Number.isFinite(minutes) ? minutes : 0) +
    (Number.isFinite(seconds) ? seconds : 0) / 60;

  if (timeMinutes <= 0 && Number.isFinite(paceInputValue) && paceInputValue > 0) {
    if (Number.isFinite(distanceKm) && distanceKm > 0) {
      timeMinutes = paceInputValue * distanceKm;
    }
  }

  const hasSession = Number.isFinite(distanceKm) && distanceKm > 0 && timeMinutes > 0;
  const pace = hasSession ? timeMinutes / distanceKm : 0;
  const speedKmMin = hasSession ? distanceKm / timeMinutes : 0;
  const speedMMin = speedKmMin > 0 ? speedKmMin * 1000 : 0;
  const speedMps = speedMMin > 0 ? speedMMin / 60 : 0;
  const strideLength =
    Number.isFinite(steps) && steps > 0 && Number.isFinite(distanceKm) && distanceKm > 0
      ? (distanceKm * 1000) / steps
      : 0;
  const stepsPerMin =
    Number.isFinite(steps) && steps > 0 && timeMinutes > 0 ? steps / timeMinutes : 0;

  const resultTime = document.getElementById("result-time");
  const resultPace = document.getElementById("result-pace");
  const resultKmMin = document.getElementById("result-km-min");
  const resultMMin = document.getElementById("result-m-min");
  const resultMS = document.getElementById("result-m-s");
  const resultStride = document.getElementById("result-stride");
  const resultCadence = document.getElementById("result-cadence");

  if (resultTime) {
    resultTime.textContent = formatTime(timeMinutes);
  }
  if (resultPace) {
    resultPace.textContent =
      Number.isFinite(pace) && pace > 0 ? `${pace.toFixed(2)} min/km` : "--";
  }
  if (resultKmMin) {
    resultKmMin.textContent =
      Number.isFinite(speedKmMin) && speedKmMin > 0 ? `${speedKmMin.toFixed(3)} km/min` : "--";
  }
  if (resultMMin) {
    resultMMin.textContent =
      Number.isFinite(speedMMin) && speedMMin > 0 ? `${Math.round(speedMMin)} m/min` : "--";
  }
  if (resultMS) {
    resultMS.textContent =
      Number.isFinite(speedMps) && speedMps > 0 ? `${speedMps.toFixed(2)} m/s` : "--";
  }
  if (resultStride) {
    resultStride.textContent =
      Number.isFinite(strideLength) && strideLength > 0 ? `${strideLength.toFixed(2)} m` : "--";
  }
  if (resultCadence) {
    resultCadence.textContent =
      Number.isFinite(stepsPerMin) && stepsPerMin > 0 ? `${Math.round(stepsPerMin)} spm` : "--";
  }

  const comparisons = comparisonProfiles.map((profile) =>
    profile.name === "You" ? { ...profile, speedMps } : profile
  );

  renderCharts(comparisons);

  const statsPayload = {
    distanceKm: Number.isFinite(distanceKm) ? distanceKm : 0,
    timeMinutes,
    pace,
    speedMps,
    speedKmMin,
    speedMMin,
    steps: Number.isFinite(steps) ? steps : 0,
    strideLength,
    stepsPerMin,
  };

  localStorage.setItem("flashTrainingStats", JSON.stringify(statsPayload));
};

const hydrateShareCard = () => {
  const storyValues = document.querySelectorAll("[data-story]");
  if (!storyValues.length) {
    return;
  }

  const fallback = {
    distanceKm: 5.0,
    timeMinutes: 24.5,
    pace: 4.9,
    speedMps: 3.4,
    steps: 6500,
    strideLength: 0.77,
    stepsPerMin: 265,
  };

  let stored = {};
  const raw = localStorage.getItem("flashTrainingStats");
  if (raw) {
    try {
      stored = JSON.parse(raw);
    } catch (error) {
      console.warn("Unable to parse stored stats.", error);
      stored = {};
    }
  }

  const stats = { ...fallback, ...stored };

  const updates = {
    distanceKm: `${formatNumber(stats.distanceKm, 2)} km`,
    time: formatTime(stats.timeMinutes),
    pace: `${formatNumber(stats.pace, 2)} min/km`,
    speed: `${formatNumber(stats.speedMps, 2)} m/s`,
    cadence: `${formatNumber(stats.stepsPerMin, 0)} spm`,
    stride: `${formatNumber(stats.strideLength, 2)} m`,
  };

  storyValues.forEach((element) => {
    const key = element.getAttribute("data-story");
    if (key && updates[key]) {
      element.textContent = updates[key];
    }
  });
};

const attachListeners = () => {
  const form = document.getElementById("calculator-form");
  if (form) {
    form.addEventListener("input", updateCalculator);
    updateCalculator();
  }
};

const setYear = () => {
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = year;
  });
};

document.addEventListener("DOMContentLoaded", () => {
  attachListeners();
  setYear();
  hydrateShareCard();
});
