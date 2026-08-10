const WHEEL_CONFIG_MOCK = {
  vehicleName: "演示车型 A",
  controls: [
    {
      key: "front",
      title: "前轮位置调整",
      labelPrefix: "前轮",
      values: {
        horizontal: 22,
        vertical: 64,
        width: 18,
      },
    },
    {
      key: "rear",
      title: "后轮位置调整",
      labelPrefix: "后轮",
      values: {
        horizontal: 79,
        vertical: 64,
        width: 18,
      },
    },
  ],
  fields: [
    { key: "horizontal", label: "水平位置", min: 0, max: 100, step: 1 },
    { key: "vertical", label: "垂直位置", min: 0, max: 100, step: 1 },
    { key: "width", label: "宽度", min: 10, max: 34, step: 1 },
  ],
};

const state = WHEEL_CONFIG_MOCK.controls.reduce((result, group) => {
  result[group.key] = { ...group.values };
  return result;
}, {});

const controlGroups = document.querySelectorAll(".control-list");
const toast = document.getElementById("toast");
const resetButton = document.getElementById("resetButton");
const saveButton = document.getElementById("saveButton");
const previewButton = document.getElementById("previewButton");
let toastTimer = 0;

function getFieldLabel(group, field) {
  return `${group.labelPrefix}${field.label}`;
}

function getRangeProgress(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = Number(input.value || 0);
  return `${((value - min) / (max - min)) * 100}%`;
}

function setRangeProgress(input) {
  input.style.setProperty("--progress", getRangeProgress(input));
}

function applyWheelPosition(groupKey) {
  const wheel = document.querySelector(`[data-wheel="${groupKey}"]`);
  const values = state[groupKey];
  if (!wheel || !values) {
    return;
  }

  wheel.style.setProperty("--x", values.horizontal);
  wheel.style.setProperty("--y", values.vertical);
  wheel.style.setProperty("--size", values.width);
}

function renderControls() {
  controlGroups.forEach((container) => {
    const groupKey = container.dataset.group;
    const group = WHEEL_CONFIG_MOCK.controls.find((item) => item.key === groupKey);
    if (!group) {
      return;
    }

    container.innerHTML = WHEEL_CONFIG_MOCK.fields.map((field) => {
      const value = state[group.key][field.key];
      const inputId = `${group.key}-${field.key}`;
      const label = getFieldLabel(group, field);
      return `
        <div class="control-item">
          <label class="control-label" for="${inputId}">
            <strong>${label}: ${value}%</strong>
            <span class="control-value">${value}%</span>
          </label>
          <input
            id="${inputId}"
            type="range"
            min="${field.min}"
            max="${field.max}"
            step="${field.step}"
            value="${value}"
            data-group="${group.key}"
            data-field="${field.key}"
          >
        </div>
      `;
    }).join("");
  });

  document.querySelectorAll('input[type="range"]').forEach((input) => {
    setRangeProgress(input);
    input.addEventListener("input", handleRangeInput);
  });
}

function handleRangeInput(event) {
  const input = event.currentTarget;
  const groupKey = input.dataset.group;
  const fieldKey = input.dataset.field;
  const value = Number(input.value);
  state[groupKey][fieldKey] = value;
  setRangeProgress(input);

  const label = input.closest(".control-item")?.querySelector(".control-label strong");
  const valueText = input.closest(".control-item")?.querySelector(".control-value");
  const group = WHEEL_CONFIG_MOCK.controls.find((item) => item.key === groupKey);
  const field = WHEEL_CONFIG_MOCK.fields.find((item) => item.key === fieldKey);
  if (label && group && field) {
    label.textContent = `${getFieldLabel(group, field)}: ${value}%`;
  }
  if (valueText) {
    valueText.textContent = `${value}%`;
  }

  applyWheelPosition(groupKey);
}

function resetConfig() {
  WHEEL_CONFIG_MOCK.controls.forEach((group) => {
    state[group.key] = { ...group.values };
    applyWheelPosition(group.key);
  });
  renderControls();
  showToast("已恢复为截图参考参数");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1600);
}

function getConfigSummary() {
  const front = state.front;
  const rear = state.rear;
  return `前轮 ${front.horizontal}/${front.vertical}/${front.width}，后轮 ${rear.horizontal}/${rear.vertical}/${rear.width}`;
}

renderControls();
Object.keys(state).forEach(applyWheelPosition);

resetButton.addEventListener("click", resetConfig);
previewButton.addEventListener("click", () => showToast(`当前参数：${getConfigSummary()}`));
saveButton.addEventListener("click", () => showToast("配置已保存到本地原型状态"));
