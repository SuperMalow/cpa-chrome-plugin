<template>
  <article :class="[
    'rounded-[30px] border p-5 shadow-[0_18px_48px_rgba(148,163,184,0.12)] backdrop-blur-xl transition dark:shadow-[0_18px_48px_rgba(2,6,23,0.28)]',
    config.enabled
      ? 'border-slate-200/90 bg-white/72 dark:border-slate-800 dark:bg-slate-900/76'
      : 'border-slate-200/80 bg-slate-100/66 dark:border-slate-800 dark:bg-slate-950/70',
  ]">
    <header class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-flex min-h-8 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-semibold tracking-[0.08em] text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
            CPA {{ String(index + 1).padStart(2, "0") }}
          </span>
          <span :class="[
            'inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-semibold tracking-[0.08em]',
            config.enabled
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300',
          ]">
            {{ config.enabled ? "已启用" : "已停用" }}
          </span>
        </div>

        <div class="mt-4">
          <h3
            class="text-[clamp(1.4rem,1.7vw,1.75rem)] font-bold leading-none tracking-[-0.04em] text-slate-800 dark:text-slate-100">
            {{ config.name || `CPA 接入 ${index + 1}` }}
          </h3>
          <p class="mt-3 max-w-2xl text-[13px] leading-6 text-slate-500 dark:text-slate-400">
            为当前接入独立维护接口地址、密钥、鉴权方式与超时时间，适合同时接入多套 CPA 服务。
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <button :class="[
          'inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border px-3 text-[11px] font-semibold transition',
          config.enabled
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/92 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] dark:border-emerald-900/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/72'
            : 'border-slate-200 bg-white/82 text-slate-700 hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_24px_rgba(112,136,181,0.12)] dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900/84',
        ]" type="button" @click="emitUpdate('enabled', !config.enabled)">
          <el-icon>
            <Switch v-if="config.enabled" />
            <CloseBold v-else />
          </el-icon>
          <span class="text-sm">{{ config.enabled ? "启用中" : "点击启用" }}</span>
        </button>

        <button
          class="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-white/82 px-3 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_24px_rgba(112,136,181,0.12)] dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:shadow-[0_10px_24px_rgba(2,6,23,0.28)]"
          type="button" @click="$emit('duplicate', config.id)">
          <el-icon>
            <CopyDocument />
          </el-icon>
          <span class="text-sm">复制</span>
        </button>

        <button
          class="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 text-[11px] font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50/92 hover:shadow-[0_10px_24px_rgba(244,63,94,0.1)] dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/62"
          type="button" @click="$emit('remove', config.id)">
          <el-icon>
            <Delete />
          </el-icon>
          <span class="text-sm">删除</span>
        </button>
      </div>
    </header>

    <div class="mt-6 grid gap-4 xl:grid-cols-2">
      <label class="space-y-2 xl:col-span-2">
        <span class="text-[12px] font-bold text-slate-700 dark:text-slate-200">接入名称</span>
        <div
          class="flex min-h-10 items-center gap-2 rounded-full border border-white/65 bg-white/72 px-3.5 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white dark:border-slate-700/70 dark:bg-slate-950/46 dark:focus-within:border-sky-400 dark:focus-within:bg-slate-950/66">
          <input :value="config.name"
            class="w-full bg-transparent text-[12px] text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="例如：CPA 接入 1 / 生产环境" @input="emitUpdate('name', $event.target.value)" />
        </div>
      </label>

      <label class="space-y-2">
        <span class="text-[12px] font-bold text-slate-700 dark:text-slate-200">CPA 接口地址</span>
        <div
          class="flex min-h-10 items-center gap-2 rounded-full border border-white/65 bg-white/72 px-3.5 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white dark:border-slate-700/70 dark:bg-slate-950/46 dark:focus-within:border-sky-400 dark:focus-within:bg-slate-950/66">
          <el-icon class="text-slate-400 dark:text-slate-500">
            <Link />
          </el-icon>
          <input :value="config.baseUrl"
            class="w-full bg-transparent text-[12px] text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="https://api.example.com/cpa" @input="emitUpdate('baseUrl', $event.target.value)" />
        </div>
      </label>

      <label class="space-y-2">
        <span class="text-[12px] font-bold text-slate-700 dark:text-slate-200">密钥</span>
        <div
          class="flex min-h-10 items-center gap-2 rounded-full border border-white/65 bg-white/72 px-3.5 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white dark:border-slate-700/70 dark:bg-slate-950/46 dark:focus-within:border-sky-400 dark:focus-within:bg-slate-950/66">
          <el-icon class="text-slate-400 dark:text-slate-500">
            <Key />
          </el-icon>
          <input :value="config.apiKey" :type="showSecret ? 'text' : 'password'"
            class="w-full bg-transparent text-[12px] text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="填写接口密钥或 Token" @input="emitUpdate('apiKey', $event.target.value)" />
          <button
            class="shrink-0 cursor-pointer rounded-full px-2 py-1 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            type="button" @click="showSecret = !showSecret">
            <span class="text-sm">{{ showSecret ? "隐藏" : "显示" }}</span>
          </button>
        </div>
      </label>

      <label class="space-y-2">
        <span class="text-[12px] font-bold text-slate-700 dark:text-slate-200">CPA 鉴权方式</span>
        <div
          class="flex min-h-10 items-center rounded-full border border-white/65 bg-white/72 px-3.5 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white dark:border-slate-700/70 dark:bg-slate-950/46 dark:focus-within:border-sky-400 dark:focus-within:bg-slate-950/66">
          <select :value="config.authType"
            class="w-full bg-transparent text-[12px] text-slate-700 outline-none dark:text-slate-100"
            @change="emitUpdate('authType', $event.target.value)">
            <option v-for="option in CPA_AUTH_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </label>

      <div class="space-y-2">
        <span class="text-[12px] font-bold text-slate-700 dark:text-slate-200">超时时间（秒）</span>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            class="inline-flex h-8 w-fit items-center overflow-hidden rounded-full border border-white/65 bg-white/72 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/46">
            <button
              class="inline-flex h-full w-10 cursor-pointer items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              type="button" @click="adjustTimeout(-5)">
              <el-icon>
                <Minus />
              </el-icon>
            </button>
            <input :value="config.timeoutSeconds"
              class="h-full w-14 bg-transparent text-center text-[12px] font-bold tabular-nums text-slate-800 outline-none dark:text-slate-100"
              type="number" min="1" max="300"
              @input="emitUpdate('timeoutSeconds', sanitizeTimeout($event.target.value))" />
            <button
              class="inline-flex h-full w-10 cursor-pointer items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              type="button" @click="adjustTimeout(5)">
              <el-icon>
                <Plus />
              </el-icon>
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <button v-for="preset in timeoutPresets" :key="preset" :class="[
              'inline-flex h-8 cursor-pointer items-center rounded-full border px-2.5 text-[10px] font-semibold transition',
              Number(config.timeoutSeconds) === preset
                ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-sky-700/70 dark:bg-sky-500/18 dark:text-sky-300'
                : 'border-slate-200 bg-white/78 text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300',
            ]" type="button" @click="emitUpdate('timeoutSeconds', preset)">
              <span class="text-sm">{{ preset }} 秒</span>
            </button>
          </div>
        </div>
        <p class="text-[12px] text-slate-500 dark:text-slate-400">
          超时后当前请求会按失败处理，建议在 30 到 60 秒之间。
        </p>
      </div>
    </div>

    <footer class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex flex-wrap gap-2">
        <span
          class="inline-flex min-h-7 items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 text-[10px] font-semibold text-blue-600 dark:border-sky-700/70 dark:bg-sky-500/18 dark:text-sky-300">
          {{ authTypeLabel }}
        </span>
        <span
          class="inline-flex min-h-7 items-center rounded-full border border-slate-200 bg-white/75 px-2.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
          {{ config.timeoutSeconds }} 秒超时
        </span>
        <span
          class="inline-flex min-h-7 max-w-full items-center rounded-full border border-slate-200 bg-white/75 px-2.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
          <span class="truncate">{{ config.baseUrl || "接口地址待填写" }}</span>
        </span>
      </div>

      <div class="flex items-center justify-end gap-2">
        <button
          class="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white/82 px-3 text-[10px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_20px_rgba(112,136,181,0.12)] disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:shadow-[0_10px_20px_rgba(2,6,23,0.24)]"
          type="button" :disabled="saving || testing" @click="$emit('test')">
          <el-icon>
            <Link />
          </el-icon>
          <span class="text-sm">{{ testing ? "测试中..." : "测试链接" }}</span>
        </button>

        <button
          class="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 text-[10px] font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-50/92 hover:shadow-[0_10px_20px_rgba(59,130,246,0.12)] disabled:cursor-not-allowed disabled:opacity-70 dark:border-sky-700/70 dark:bg-sky-500/18 dark:text-sky-300 dark:hover:border-sky-600 dark:hover:bg-sky-500/24 dark:hover:shadow-[0_10px_20px_rgba(2,132,199,0.18)]"
          type="button" :disabled="saving || testing" @click="$emit('save')">
          <el-icon>
            <Check />
          </el-icon>
          <span class="text-sm">{{ saving ? "保存中..." : "保存设置" }}</span>
        </button>
      </div>
    </footer>
  </article>
</template>

<script setup>
import { computed, ref } from "vue";
import { ElIcon } from "element-plus";
import {
  CloseBold,
  Check,
  CopyDocument,
  Delete,
  Key,
  Link,
  Minus,
  Plus,
  Switch,
} from "@element-plus/icons-vue";
import { CPA_AUTH_OPTIONS } from "@/constants/cpaSettings";

const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  testing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update", "duplicate", "remove", "save", "test"]);

const timeoutPresets = [15, 30, 60];
const showSecret = ref(false);

const authTypeLabel = computed(() => {
  const matched = CPA_AUTH_OPTIONS.find((item) => item.value === props.config.authType);
  return matched?.label || "未选择鉴权方式";
});

const sanitizeTimeout = (value) => {
  const numberValue = Number(value);

  if (!numberValue || Number.isNaN(numberValue)) {
    return 1;
  }

  return Math.min(Math.max(Math.round(numberValue), 1), 300);
};

const emitUpdate = (field, value) => {
  emit("update", {
    id: props.config.id,
    patch: {
      [field]: field === "timeoutSeconds" ? sanitizeTimeout(value) : value,
    },
  });
};

const adjustTimeout = (delta) => {
  emitUpdate("timeoutSeconds", Number(props.config.timeoutSeconds || 0) + delta);
};
</script>
