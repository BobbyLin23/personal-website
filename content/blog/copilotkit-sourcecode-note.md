---
title: CopilotKit 源码学习
date: 2026-2-10
description: Notes for CopilotKit source code.
draft: false
tags:
  - AI Coding
  - Tech
  - Source Code
---

## 基本介绍

CopilotKit 是一个用于将 AI Copilot 和 AI Agent 集成到 web 应用程序中的框架。

源码地址：<https://github.com/CopilotKit/CopilotKit>

文档：<https://docs.copilotkit.ai/>

参考：<https://deepwiki.com/CopilotKit/CopilotKit>

本文基于v2.x的源码进行分析与学习。

## 系统架构

CopilotKit 的架构主要分为三层：

- 前端：提供支持 React / Angular 框架的组件以及 hooks
- 传输层：使用 GraphQL 客户端处理前后端之间的通信
- 后端：用于处理 LLM 交互以及 管理 Agent
- AG-UI 协议：实现框架无关的Agent 标准化层

项目使用了基于 Turborepo 的架构，所有的包都在 `packages` 下

基本代码目录

- packages/core
- packages/react
- packages/runtime
- packages/agent
- packages/shared
- packages/web-inspector

![copilotkit-structure](/copilotkit-structure.PNG)

### 核心层

@copilotkitnext/core

在这个包中

### Core

`src/v2.x/packages/core/src/core/core.ts`

在这里定了最核心的类 `CopilotKitCore`

1. 私有属性：
   1. `_headers`、`_credentials`、`_properties`：核心配置
   2. `subscribers`：订阅者集合（Set）
   3. 五个委托子系统：
      - `agentRegistry`：Agent 管理
      - `contextStore`：上下文管理
      - `suggestionEngine`：suggestion管理
      - `runHandler`：运行处理
      - `stateManager`：状态管理
2. 构造函数，初始化流程：
   1. 保存基础配置
   2. 初始化五个委托子系统
   3. 调用各子系统的 `initialize()` 方法
   4. 设置运行时 URL 和传输方式
   5. 订阅 `onAgentsChanged` 事件，为新 Agent 订阅状态管理
3. 订阅通知机制 :br`notifySubscribers`
   1. 遍历所有订阅者
   2. 执行传入的 handler 函数
   3. 捕获错误并打印，避免一个订阅者失败影响其他订阅者
   :br`emitError`
   1. 专门用于发送错误事件
   2. 调用 `notifySubscribers` 触发 `onError` 回调
4. Getter
5. Setter
6. 委托方法：所有业务方法都委托给相应的子系统

这里使用了委托模式（Delegation Pattern）：核心类不直接处理业务逻辑，而是委托给专门的子系统（AgentRegistry、ContextStore 等），每个子系统负责单一职责。然后通过发布-订阅模式：通过subscribe/notifySubscribers 实现事件驱动架构，UI 层可以订阅各种状态变化。

并且与 `ag-ui/client` 的AbstractAgent集成，提供更高层的封装

### 前端部分

@copilotkitnext/react

在这个包中，主要导出的部分有：

- Components
- Hooks
- Providers
- 类型文件 types
- React-core

### Providers

`CopilotKitProvider` 这个组件为应用中所有 CopilotKit 功能建立了上下文。它负责管理前端 React 组件与后端 CopilotRuntime 之间的连接，处理身份认证，并将相关配置向下传递给所有子级的 Hooks 和组件。

Context定义

```typescript
const CopilotKitContext = createContext<CopilotKitContextValue>({
  copilotkit: null!,
  executingToolCallIds: EMPTY_SET,
})
```

包含：

- `copilotkit`：`CopilotKitCoreReact` 实例
- `executingToolCallIds`：正在执行的 tool call ID 集合（用于跟踪执行状态）

Props

包含所有可配置项：

| 属性                              | 说明                              |
| ------------------------------- | ------------------------------- |
| runtimeUrl                      | 后端服务地址                          |
| headers                         | 自定义请求头                          |
| credentials                     | fetch 请求的 credentials 模式        |
| publicApiKey / publicLicenseKey | Copilot Cloud API key（两个是别名）    |
| properties                      | 传递给后端的额外属性                      |
| useSingleEndpoint               | 是否使用单一端点模式                      |
| agents\_\_unsafe\_dev\_only     | 仅开发用的本地 Agent                   |
| renderToolCalls                 | 工具调用的渲染器数组                      |
| renderActivityMessages          | 活动消息的渲染器数组                      |
| renderCustomMessages            | 自定义消息渲染器                        |
| frontendTools                   | 前端工具定义                          |
| humanInTheLoop                  | 人机协作工具（需要用户确认的工具）               |
| showDevConsole                  | 是否显示开发者调试控制台（true/false/"auto"） |

对于处理数组类型的props，这里定义了一个函数进行处理,将数组 prop 转为稳定的引用，避免不必要的重渲染.

这个函数的用途是提示用户使用稳定的数组，避免动态添加/删除工具导致的性能问题。

```typescript
function useStableArrayProp<T>(
  prop: T[] | undefined,
  warningMessage?: string,
  isMeaningfulChange?: (initial: T[], next: T[]) => boolean,
): T[] {
  const empty = useMemo<T[]>(() => [], [])
  const value = prop ?? empty
  const initial = useRef(value)

  useEffect(() => {
    if (
      warningMessage
      && value !== initial.current
      && (isMeaningfulChange ? isMeaningfulChange(initial.current, value) : true)
    ) {
      console.error(warningMessage)
    }
  }, [value, warningMessage])

  return value
}
```

核心逻辑

1. 根据 `showDevConsole` 的值决定是否渲染 `CopilotKitInspector`
2. 数组 Props 标准化，同时内置了默认的 activity renderers（如 MCP Apps 的渲染器），并与用户提供的合并。
3. API 配置处理，验证至少提供一个配置（`runtimeUrl` 或 API key 或本地 Agent）
4. 工具处理
   1. Frontend Tools 和 Human-in-the-loop Tools 的标准化：
      - 处理 `frontendTools` 和 `humanInTheLoop` 数组
   2. Human-in-the-loop 特殊处理：
      - 将 HITL 工具转换为 `FrontendTool` 格式
      - 创建基于 Promise 的 handler
      - 提取 render 组件到 `renderToolCalls` 列表
   3. 合并所有工具：
      - 整合 `frontendTools` 和 HITL tools
      - 整合所有需要渲染的 tool calls（包括用户提供的、frontend tools、HITL tools）
5. 创建CopilotKitCoreReact实例
6. 订阅状态变化
   1. 重新渲染订阅：
      - 订阅 `renderToolCalls` 变化，强制触发组件重渲染
   2. 执行中 Tool Call 跟踪：
   3. 在 Provider 级别跟踪正在执行的 tool call IDs
   4. 监听 `onToolExecutionStart` 和 `onToolExecutionEnd` 事件
7. 动态配置更新：当配置变化时，动态更新核心实例的配置：
   1. Runtime URL、传输方式、请求头
   2. 认证信息、属性、Agents

### React Core Copilot实例

`src/v2.x/packages/react/src/lib/react-core.ts`

这里定义了CopilotKitCoreReact类，它继承自 `CopilotKitCore`，专门处理React相关的渲染器管理。

```typescript
export class CopilotKitCoreReact extends CopilotKitCore {
  private _renderToolCalls: ReactToolCallRenderer<any>[] = []
  private _renderCustomMessages: ReactCustomMessageRenderer[] = []
  private _renderActivityMessages: ReactActivityMessageRenderer<any>[] = []

  constructor(config: CopilotKitCoreReactConfig) {
    super(config)
    this._renderToolCalls = config.renderToolCalls ?? []
    this._renderCustomMessages = config.renderCustomMessages ?? []
    this._renderActivityMessages = config.renderActivityMessages ?? []
  }

  get renderCustomMessages(): Readonly<ReactCustomMessageRenderer[]> {
    return this._renderCustomMessages
  }

  get renderActivityMessages(): Readonly<ReactActivityMessageRenderer<any>>[] {
    return this._renderActivityMessages
  }

  get renderToolCalls(): Readonly<ReactToolCallRenderer<any>>[] {
    return this._renderToolCalls
  }

  setRenderToolCalls(renderToolCalls: ReactToolCallRenderer<any>[]): void {
    this._renderToolCalls = renderToolCalls

    // Notify React-specific subscribers
    void this.notifySubscribers(
      (subscriber) => {
        const reactSubscriber = subscriber as CopilotKitCoreReactSubscriber
        if (reactSubscriber.onRenderToolCallsChanged) {
          reactSubscriber.onRenderToolCallsChanged({
            copilotkit: this,
            renderToolCalls: this.renderToolCalls,
          })
        }
      },
      'Subscriber onRenderToolCallsChanged error:'
    )
  }

  // Override to accept React-specific subscriber type
  subscribe(subscriber: CopilotKitCoreReactSubscriber): CopilotKitCoreSubscription {
    return super.subscribe(subscriber)
  }
}
```

1. 私有属性

三个私有数组存储渲染器：

- `_renderToolCalls`：存储 tool call 渲染器
- `_renderCustomMessages`：存储自定义消息渲染器
- `_renderActivityMessages`：存储活动消息渲染器

1. 构造函数

- 调用父类构造函数 `super(config)`
- 从配置中提取渲染器数组并初始化（使用空数组作为默认值）

1. Getter 方法,三个只读 getter 方法：

- renderCustomMessages：获取自定义消息渲染器列表
- renderActivityMessages：获取活动消息渲染器列表
- renderToolCalls：获取 tool call 渲染器列表

返回类型使用 `Readonly` 包装，防止外部直接修改数组。

1. 更新渲染器方法

setRenderToolCalls 方法：

- 更新 `_renderToolCalls` 数组
- 调用 `notifySubscribers` 通知所有订阅者
- 通过 `CopilotKitCoreReactSubscriber` 类型检查，只调用 `onRenderToolCallsChanged` 回调
- 传递当前 `copilotkit` 实例和渲染器列表给回调函数

原理：这是实现 React 响应式的关键。当渲染器列表变化时，通知 Provider 中的 `forceUpdate`，触发组件树重渲染以显示新的 tool call UI。

1. 订阅方法重写

subscribe 方法重写：

- 接受 CopilotKitCoreReactSubscriber 类型（支持 React 特有的事件）
- 内部调用父类的 super.subscribe(subscriber)
- 类型上保证订阅者可以使用 onRenderToolCallsChanged 回调

### Hooks

1. useRenderToolCall :br**功能**：渲染工具调用的可视化组件，根据工具状态（Complete/Executing/InProgress）显示不同 UI。
2. useRenderCustomMessages :br**功能**：渲染自定义消息组件，允许为特定消息类型或位置提供自定义 UI。
3. useRenderActivityMessage :br**功能**：渲染活动消息（ActivityMessage），支持类型化内容解析。
4. useFrontendTool :br**功能**：在组件中注册前端工具（可被 AI 调用，执行前端逻辑）。
5. useHumanInTheLoop :br**功能**：实现人机协作工具，等待用户响应后再继续执行。 :br**原理**：
   - 使用 `useRef` 存储 Promise 的 resolve 函数
   - `handler` 返回一个 Promise，阻塞工具执行直到用户响应
   - 根据状态（inProgress/executing/complete）向渲染组件注入不同的 props
   - `executing` 状态时提供 `respond` 函数供用户调用以继续执行
   - 卸载时移除渲染器
6. useAgent :br**功能**：获取 Agent 实例并订阅其更新。 :br**原理**：
   - 支持三种更新类型：`OnMessagesChanged`、`OnStateChanged`、`OnRunStatusChanged`
   - 运行时未连接时返回**临时 Agent**（`ProxiedCopilotRuntimeAgent`）
   - 使用 `useReducer` 的 `forceUpdate` 触发重渲染
   - 通过 `agent.subscribe` 订阅指定类型的更新事件
7. useAgentContext :br**功能**：向 Agent 添加上下文信息（如当前页面状态、用户信息等）。
8. useSuggestions :br**功能**：获取和管理建议列表（用户可点击的快捷操作建议）。
9. useConfigureSuggestions :br**功能**：配置建议生成方式（静态建议或动态生成）。

### 后端部分

@copilotkitnext/runtime

`/src/v2.x/packages/runtime/src/runtime.ts`

定义 CopilotRuntime 类，作为 CopilotKit 的核心运行时容器

- 聚合所有运行时依赖：agents、runner、transcriptionService、中间件
- 使用 `MaybePromise<>` ,支持 agents 懒加载
- 默认使用 `InMemoryAgentRunner` 作为运行器

`/src/v2.x/packages/runtime/src/endpoints/hono.ts`

`/src/v2.x/packages/runtime/src/endpoints/hono-single.ts`

提供与 Hono 框架集成的 HTTP 接口，用于接收客户端请求并路由到运行时处理

Runner

1. AgentRunner :br 功能：定义智能体执行的标准接口 :br 核心方法：
   - run()：启动新运行，返回 `Observable<BaseEvent>` 事件流
   - connect()：连接到现有线程，恢复历史事件
   - isRunning()：检查线程是否正在运行
   - stop()：中止运行
2. InMemoryAgentRunner :br 功能：内存存储的运行器实现，支持热重载恢复 :br 核心机制：
   1. 全局状态存储：使用 `Symbol.for()` 在 `globalThis` 上存储，确保热重载后数据不丢失
   2. 事件流管理：使用 RxJS `ReplaySubject`实现事件订阅和重放
      1. run()：启动新运行，返回事件流
      2. connect()：重放历史事件 + 订阅实时事件
      3. 事件压缩（`compactEvents`）：减少存储冗余
   3. 消息去重：通过 `seenMessageIds` 和 `historicMessageIds` 防止重复消息
   4. 运行链追踪：`parentRunId` 机制支持多轮对话的链式追踪

@copilotkitnext/agent

- `BuiltInAgent` 把 AG-UI message/tool 转成 Vercel AI SDK 格式。
- 用 `streamText` 拉模型流并映射成 AG-UI 事件（text chunk/tool args/tool result/run finished）。
- 内建两个状态工具 `AGUISendStateSnapshot/Delta`，让模型可直接修改前端状态。
- 支持 MCP server 工具注入（HTTP/SSE transport）。
- `forwardedProps` 不是全量覆盖，而是白名单可覆盖字段。

## 总结

1. 核心架构分层
   1. 前端内核：`CopilotKitCore` 由 `AgentRegistry + RunHandler + SuggestionEngine + StateManager + ContextStore` 组合而成
   2. 后端运行时：`CopilotRuntime` 持有 agents、runner、中间件和转录服务
   3. 框架层：React 的 `CopilotKitProvider` 构建 `CopilotKitCoreReact`
2. 前端到后端的主调用链（一次聊天）
   1. `CopilotChat` 初始化时先 `connectAgent`，发送消息时 `runAgent`
   2. `CopilotKitCore.runAgent()` 委托给 `RunHandler.runAgent()`
   3. `RunHandler` 调用 agent 的 `runAgent`，把 `forwardedProps + context + frontend tools` 一起传入
   4. 后端 `handleRunAgent` 校验 `RunAgentInputSchema`，用 `EventEncoder` 把事件流编码成 SSE 返回
   5. agent 事件回流后，UI 通过 hooks/components 自动渲染。
3. 关键机制 A：runtime 发现与代理 agent
   1. 设置 `runtimeUrl` 后，`AgentRegistry` 在浏览器端拉 `/info`（或 single-route 的 `method=info`）发现远端 agent
   2. 每个远端 agent 被包装成 `ProxiedCopilotRuntimeAgent`，支持 REST 与 single-route 两种传输。
   3. `useAgent` 在 runtime 还没同步完成时会给“临时代理 agent”，避免 UI 早期拿不到 agent。
4. 关键机制 B：前端工具调用与自动 follow-up
   1. `RunHandler.processAgentResult()` 扫描 assistant 的 toolCalls，执行匹配 tool，或走 通配工具。
   2. 工具参数先 JSON.parse；失败会发错误事件；执行结果会插入一条 `role=tool` 消息回 agent 历史。
   3. 如果 tool `followUp !== false`，会递归再跑一轮 agent。
   4. tool schema 从 zod 转 JSON schema，并剔除 `additionalProperties`，减少模型侧 schema 兼容问题。
5. 关键机制 C：线程级状态与消息-运行关联
   1. `StateManager` 按 `agentId/threadId/runId` 记录 state 快照，并记录 `messageId -> runId` 映射。
   2. React 自定义消息渲染时可回查“这条消息属于哪个 run、当时状态是什么”。
6. 关键机制 D：后端 runner 的可恢复事件流
   1. 默认 `InMemoryAgentRunner` 用全局 store 按 thread 保存历史 run 事件，支持热重载后恢复。
   2. `run()` 流结束前会 `finalizeRunEvents` 补齐未闭合 text/tool 事件，并强制补 terminal event。
   3. `connect()` 会先回放 compact 后的历史事件，再桥接当前活跃 run。
   4. `stop()` 设置 stopRequested 并调用 `agent.abortRun()`。
