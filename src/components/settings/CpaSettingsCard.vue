<template>
  <article
    :class="[
      'rounded-[30px] border p-5 shadow-[0_18px_48px_rgba(148,163,184,0.12)] backdrop-blur-xl transition dark:shadow-[0_18px_48px_rgba(2,6,23,0.28)]',
      config.enabled
        ? 'border-slate-200/90 bg-white/72 dark:border-slate-800 dark:bg-slate-900/76'
        : 'border-slate-200/80 bg-slate-100/66 dark:border-slate-800 dark:bg-slate-950/70',
    ]"
  >
    <header class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex min-h-8 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-semibold tracking-[0.08em] text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
            CPA {{ String(index + 1).padStart(2, "0") }}
          </span>
          <span
            :class="[
              'inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-semibold tracking-[0.08em]',
              config.enabled
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300',
            ]"
          >
            {{ config.enabled ? "已启用" : "已停用" }}
          </span>
        </div>

        <div class="mt-4">
          <input
            :value="config.name"
            class="w-full bg-transparent text-[clamp(1.9rem,2vw,2.25rem)] font-semibold leading-none tracking-[-0.04em] text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="例如：CPA 生产环境"
            @input="emitUpdate('name', $event.target.value)"
          />
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            为当前接入独立维护接口地址、密钥、鉴权方式与超时时间，适合同时接入多套 CPA 服务。
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <button
          :class="[
            'inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition',
            config.enabled
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/92 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] dark:border-emerald-900/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/72'
              : 'border-slate-200 bg-white/82 text-slate-700 hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_24px_rgba(112,136,181,0.12)] dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900/84',
          ]"
          type="button"
          @click="emitUpdate('enabled', !config.enabled)"
        >
          <el-icon>
            <Switch v-if="config.enabled" />
            <CloseBold v-else />
          </el-icon>
          {{ config.enabled ? "启用中" : "点击启用" }}
        </button>

        <button
          class="inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white/82 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_24px_rgba(112,136,181,0.12)] dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:shadow-[0_10px_24px_rgba(2,6,23,0.28)]"
          type="button"
          @click="$emit('duplicate', config.id)"
        >
          <el-icon><CopyDocument /></el-icon>
          复制
        </button>

        <button
          class="inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50/92 hover:shadow-[0_10px_24px_rgba(244,63,94,0.1)] dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/62"
          type="button"
          @click="$emit('remove', config.id)"
        >
          <el-icon><Delete /></el-icon>
          删除
        </button>
      </div>
    </header>

    <div class="mt-6 grid gap-4 xl:grid-cols-2">
      <label class="space-y-2">
        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">CPA 接口地址</span>
        <div class="flex min-h-14 items-center gap-3 rounded-[22px] border border-white/65 bg-white/72 px-4 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white dark:border-slate-700/70 dark:bg-slate-950/46 dark:focus-within:border-sky-400 dark:focus-within:bg-slate-950/66">
          <el-icon class="text-slate-400 dark:text-slate-500">
            <Link />
          </el-icon>
          <input
            :value="config.baseUrl"
            class="w-full bg-transparent text-[15px] text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="https://api.example.com/cpa"
            @input="emitUpdate('baseUrl', $event.target.value)"
          />
        </div>
      </label>

      <label class="space-y-2">
        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">密钥</span>
        <div class="flex min-h-14 items-center gap-3 rounded-[22px] border border-white/65 bg-white/72 px-4 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white dark:border-slate-700/70 dark:bg-slate-950/46 dark:focus-within:border-sky-400 dark:focus-within:bg-slate-950/66">
          <el-icon class="text-slate-400 dark:text-slate-500">
            <Key />
          </el-icon>
          <input
            :value="config.apiKey"
            :type="showSecret ? 'text' : 'password'"
            class="w-full bg-transparent text-[15px] text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="填写接口密钥或 Token"
            @input="emitUpdate('apiKey', $event.target.value)"
          />
          <button
            class="shrink-0 cursor-pointer rounded-full px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            type="button"
            @click="showSecret = !showSecret"
          >
            {{ showSecret ? "隐藏" : "显示" }}
          </button>
        </div>
      </label>

      <label class="space-y-2">
        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">CPA 鉴权方式</span>
        <div class="flex min-h-14 items-center rounded-[22px] border border-white/65 bg-white/72 px-4 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white dark:border-slate-700/70 dark:bg-slate-950/46 dark:focus-within:border-sky-400 dark:focus-within:bg-slate-950/66">
          <select
            :value="config.authType"
            class="w-full bg-transparent text-[15px] text-slate-700 outline-none dark:text-slate-100"
            @change="emitUpdate('authType', $event.target.value)"
          >
            <option
              v-for="option in CPA_AUTH_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </label>

      <div class="space-y-2">
        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">超时时间（秒）</span>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="inline-flex h-14 w-fit items-center overflow-hidden rounded-[22px] border border-white/65 bg-white/72 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/46">
            <button
              class="inline-flex h-full w-14 cursor-pointer items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              type="button"
              @click="adjustTimeout(-5)"
            >
              <el-icon><Minus /></el-icon>
            </button>
            <input
              :value="config.timeoutSeconds"
              class="h-full w-20 bg-transparent text-center text-lg font-semibold tabular-nums text-slate-800 outline-none dark:text-slate-100"
              type="number"
              min="1"
              max="300"
              @input="emitUpdate('timeoutSeconds', sanitizeTimeout($event.target.value))"
            />
            <button
              class="inline-flex h-full w-14 cursor-pointer items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              type="button"
              @click="adjustTimeout(5)"
            >
              <el-icon><Plus /></el-icon>
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="preset in timeoutPresets"
              :key="preset"
              :class="[
                'inline-flex h-10 cursor-pointer items-center rounded-full border px-3 text-xs font-semibold transition',
                Number(config.timeoutSeconds) === preset
                  ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-sky-700/70 dark:bg-sky-500/18 dark:text-sky-300'
                  : 'border-slate-200 bg-white/78 text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300',
              ]"
              type="button"
              @click="emitUpdate('timeoutSeconds', preset)"
            >
              {{ preset }} 秒
            </button>
          </div>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          超时后当前请求会按失败处理，建议在 30 到 60 秒之间。
        </p>
      </div>
    </div>

    <footer class="mt-6 flex flex-wrap gap-2">
      <span class="inline-flex min-h-9 items-center rounded-full border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-600 dark:border-sky-700/70 dark:bg-sky-500/18 dark:text-sky-300">
        {{ authTypeLabel }}
      </span>
      <span class="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-white/75 px-3 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
        {{ config.timeoutSeconds }} 秒超时
      </span>
      <span class="inline-flex min-h-9 max-w-full items-center rounded-full border border-slate-200 bg-white/75 px-3 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
        <span class="truncate">{{ config.baseUrl || "接口地址待填写" }}</span>
      </span>
    </footer>
  </article>
</template>

<script setup>
import { computed, ref } from "vue";
import { ElIcon } from "element-plus";
import {
  CloseBold,
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
});

const emit = defineEmits(["update", "duplicate", "remove"]);

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
