export interface ResumeContact {
  label: string
  value: string
  href?: string
}

export interface ResumeExperience {
  period: string
  role: string
  company: string
  location: string
  highlights: string[]
}

export interface ResumeSkillGroup {
  title: string
  items: string[]
}

export interface ResumeEducation {
  period: string
  degree: string
  school: string
  major: string
}

export interface ResumeProject {
  period: string
  name: string
  url?: string
  intro: string
  tech?: string
  highlights: string[]
}

export interface ResumeContent {
  name: string
  title: string
  location: string
  contact: ResumeContact[]
  sections: {
    experience: string
    skills: string
    education: string
    projects: string
    languages: string
  }
  experience: ResumeExperience[]
  skills: ResumeSkillGroup[]
  education: ResumeEducation[]
  projects: ResumeProject[]
  languages: string[]
}

export const resumeData: Record<'zh' | 'en', ResumeContent> = {
  zh: {
    name: '林张生',
    title: '前端开发工程师',
    location: '上海',
    contact: [
      { label: '邮箱', value: 'linzhangsheng23@gmail.com', href: 'mailto:linzhangsheng23@gmail.com' },
      { label: '电话', value: '13671893391', href: 'tel:+8613671893391' },
      { label: '微信', value: 'lzs751525853' },
      { label: '个人网站', value: 'bobbylin.top', href: 'https://www.bobbylin.top/' },
      { label: 'GitHub', value: 'BobbyLin23', href: 'https://github.com/BobbyLin23' },
    ],
    sections: {
      experience: '工作经历',
      skills: '专业技能',
      education: '教育经历',
      projects: '项目经历',
      languages: '语言水平',
    },
    experience: [
      {
        period: '2025/05 – 至今',
        role: '前端开发工程师',
        company: '解螺旋（上海）医学科技有限公司',
        location: '上海',
        highlights: [
          '负责 Helix AI 科研协作平台（NewIdea 科研写作工作站）Web 端从 0 到 1 的核心模块交付：任务创建与管理、任务详情步骤流转、SSE 实时日志/阶段推送、Token 用量仪表盘、富文本编辑与审阅导出等，支撑 SaaS 与一体机（AIO）多站点形态的稳定上线与持续迭代。',
          '主导前端架构与工程化建设：统一 API 层与鉴权刷新机制、运行时环境注入与 Docker 编排落地，推进 Plate/Slate 编辑器插件化能力（Diff、Mermaid、表格、序列化等）及性能优化；负责关键代码评审与疑难问题攻关，组织内部分享沉淀最佳实践，提升交付效率与代码可维护性。',
        ],
      },
      {
        period: '2024/03 – 2025/05',
        role: '全栈工程师',
        company: '弗若斯特沙利文（北京）咨询有限公司上海分公司',
        location: '上海',
        highlights: [
          '深入参与公司产品的需求分析与架构设计，将复杂业务需求转化为高效可行的技术方案，成功推动多个项目在 3 个月内从概念阶段快速落地实施。',
          '主导前端技术选型与框架搭建，优化关键性能指标，使页面加载速度提升 35%，并实现设计稿还原度高达 98%，显著提升用户体验。',
          '与后端团队紧密协作完成系统模型设计，开发并部署一系列高可用性 API 接口，将系统故障率降低 45%，确保服务稳定性达到 99.9% 以上。',
          '核心参与基于 Slate.js 的富文本编辑器开发，优化其功能模块与扩展性，提升编辑性能达 20%，助力产品在同类市场中具备更强竞争力。',
        ],
      },
      {
        period: '2023/07 – 2024/01',
        role: '软件开发工程师',
        company: '上海怀信智能科技有限公司',
        location: '上海',
        highlights: [
          '负责 MES 系统基于 Web 的前端页面开发。',
          '结合业务需求对 Siemens OpCenter EXPR 系统进行二次开发。',
          '负责所属模块的代码开发、调试与维护工作。',
        ],
      },
      {
        period: '2022/12 – 2023/05',
        role: '前端开发工程师',
        company: '上海聆云信息技术有限公司',
        location: '上海',
        highlights: [
          '负责 To B 端管理系统的开发工作，使用 Vue 3、TypeScript、Element Plus 与 ECharts 完成复杂数据展示与权限配置。',
          '根据原型设计完成和实现项目代码，解决复杂权限配置问题。',
        ],
      },
    ],
    skills: [
      {
        title: '核心前端架构',
        items: [
          'JavaScript / TypeScript：掌握 ES6+、异步与事件循环、模块化与工程化；理解作用域、闭包、原型链等核心机制；熟悉常用设计模式与可维护代码实践。',
          'React 生态：熟练 React Hooks、Context、组件抽象与状态管理（Zustand 等）；掌握路由、表单、权限与微前端接入；具备性能优化经验（memo / useMemo / useCallback、渲染分析、代码分割、懒加载）。',
          'Vue 生态：熟练 Vue 3（Composition API）、Pinia、Vue Router；能够进行组件库封装与复杂业务模块拆分；理解响应式原理与渲染机制。',
          '构建与优化：熟悉 Vite / Webpack 构建链路、Babel、PostCSS；能够设计多环境配置与 CI 构建流程；掌握性能与体验优化（首屏、资源缓存、按需加载、包体积分析、CDN、错误监控与埋点）。',
        ],
      },
      {
        title: '全栈开发与跨端',
        items: [
          'Node.js 全栈开发：熟悉 TypeScript 技术栈与服务端工程实践，能够基于 NestJS / Hono 等框架完成 API 设计与实现、参数校验、鉴权与权限控制、错误处理与日志体系等。',
          '全栈框架落地：掌握 Next.js、TanStack Start、Nuxt 等全栈框架的路由与渲染模式（CSR/SSR/SSG/ISR）、数据获取与缓存策略、Server Actions/中间件能力。',
          '数据库与数据建模：熟悉 PostgreSQL，能够进行表结构与索引设计、查询优化、事务与并发处理等；掌握 Drizzle ORM 的类型安全建模、迁移与数据访问层封装。',
          '跨端与多端交付：熟悉 React Native 与 Expo 的工程化与发布流程；了解 Taro 小程序多端方案与 Tauri 桌面端方案。',
        ],
      },
      {
        title: 'AI',
        items: [
          'AI Agent Coding：熟练掌握 Cursor、Codex、Claude Code 等 Agent 工具链，能够将需求拆解为可执行任务并通过多轮对话驱动实现；具备将常见能力沉淀为可复用 skills 的经验。',
          'Agent 开发：具备从 0 到 1 搭建智能体应用的能力，熟悉 Mastra、Vercel AI SDK、LangChain 等框架的核心概念与工程落地（模型接入、工具/函数调用、RAG、结构化输出、流式响应、评测与观测）。',
          'Python：具备自学基础，能够使用 Python 编写数据处理与自动化脚本。',
          'AI 相关探索：持续关注并实践 Dify、n8n、Inngest 等平台与工作流方案，能够搭建从数据接入、触发器、编排到落库/通知的自动化流程。',
        ],
      },
    ],
    education: [
      {
        period: '2014/09 – 2018/06',
        degree: '学士',
        school: '上海电力大学',
        major: '电子信息工程',
      },
    ],
    projects: [
      {
        period: '2025/10 – 2026/03',
        name: 'Helix AI 科研工作站',
        url: 'https://workstation.newidea.pro',
        intro: '面向科研/写作场景的 AI 自动化工作站：用户创建与管理 AI 写作任务、查看实时执行日志与仪表盘，并在富文本环境中编辑、审阅与导出内容；支持 SaaS 与一体机等多站点形态。',
        tech: 'Next.js 14（App Router）+ React 18 + TypeScript + Tailwind CSS；Zustand / Immer；umi-request；SSE；Plate（Slate）富文本编辑器；Chart.js；Zod / TanStack Form；pnpm + biome/Husky。',
        highlights: [
          '负责核心业务页面前端实现：任务列表与分页、任务详情与步骤流转、仪表盘与 Token 用量等模块的数据拉取、状态同步与交互优化。',
          '设计并实现统一的 API 层：基于 umi-request 的 prefix、Bearer 鉴权、401 与 Token 刷新、业务错误码分流及 i18n 错误文案。',
          '实现 AI 产出与任务日志的流式展示：对接服务端事件流，使用 Streamdown + Markdown 等组件做流式/增量渲染。',
          '复杂表单与依赖展示：多类型任务表单、字段联动与校验，提升多场景任务创建与编辑的可维护性。',
          '基于 Plate 插件体系搭建编辑器能力（Diff、Mermaid、表格与序列化等），支撑长文档编辑、对比与导出链路。',
        ],
      },
      {
        period: '2025/05 – 至今',
        name: 'NewIdea AI 医学科研工作台',
        url: 'https://newidea.pro',
        intro: '面向医学及科研场景的垂直领域 AI 智能协作平台。深度集成 Dify 编排能力，并基于 CopilotKit 构建前端工具调用层，将页面核心能力开放给 AI 助手，打造涵盖文献深度解析、学术论著辅助、基金标书撰写等全链路的 AI 助手矩阵。',
        tech: 'Next.js、React、Tailwind CSS、Dify、Docker、CopilotKit',
        highlights: [
          '传统工作台页面维护与开发，针对不同场景将一套代码复用为十几个写作工作台部署。',
          '主导「AI Agent + 沉浸式工作台」融合架构设计，将前沿 AI 能力无缝转化为流畅的用户交互体验。',
          '深度定制 Platejs 沉浸式科研编辑器，主导 AI 划词提炼、修订模式、智能提醒功能，攻克富文本中的原子化增量渲染难题，将科研标书产出效能提升 70%。',
        ],
      },
      {
        period: '2024/05 – 2024/12',
        name: '脑力擎编辑器',
        url: 'https://www.knowlengine.com',
        intro: '参与开发企业级智能写作编辑器系统，基于 React 和 SlateJS 的专业文档编辑平台。项目采用 monorepo 架构，使用 pnpm workspace 进行包管理，实现高度模块化和可扩展的系统设计。',
        tech: 'React、TypeScript、SlateJS、Vite、pnpm',
        highlights: [
          '基于 SlateJS 进行二次封装，实现可配置化的编辑器核心功能，设计插件化架构支持功能即插即用，优化大文档编辑性能。',
          '采用 Slate.js 与 Yjs 结合构建富文本协同编辑器，配合 Hocuspocus 实现实时协作与数据持久化。',
          '设计实现词条数据处理核心模块，开发多格式文档导出功能（Word、纯文本）与 ECharts 专业图表生成系统。',
          '采用 TypeScript 进行类型安全开发，实现完整单元测试体系与模块化代码组织策略。',
        ],
      },
    ],
    languages: [
      '普通话：母语',
      '英语：熟练',
    ],
  },
  en: {
    name: 'Lin Zhangsheng',
    title: 'Frontend Engineer',
    location: 'Shanghai, China',
    contact: [
      { label: 'Email', value: 'linzhangsheng23@gmail.com', href: 'mailto:linzhangsheng23@gmail.com' },
      { label: 'Phone', value: '+86 136 7189 3391', href: 'tel:+8613671893391' },
      { label: 'WeChat', value: 'lzs751525853' },
      { label: 'Website', value: 'bobbylin.top', href: 'https://www.bobbylin.top/' },
      { label: 'GitHub', value: 'BobbyLin23', href: 'https://github.com/BobbyLin23' },
    ],
    sections: {
      experience: 'Experience',
      skills: 'Skills',
      education: 'Education',
      projects: 'Projects',
      languages: 'Languages',
    },
    experience: [
      {
        period: 'May 2025 – Present',
        role: 'Frontend Engineer',
        company: 'HelixLife (Shanghai) Medical Technology Co., Ltd.',
        location: 'Shanghai',
        highlights: [
          'Led core Web delivery for the Helix AI research collaboration platform (NewIdea writing workstation) from 0 to 1: task creation and management, step-based task flows, SSE real-time logs/stage updates, token usage dashboards, rich-text editing, review, and export — supporting both SaaS and AIO multi-site deployments.',
          'Drove frontend architecture and engineering: unified API layer with auth refresh, runtime environment injection, Docker orchestration, Plate/Slate editor pluginization (Diff, Mermaid, tables, serialization), and performance optimization; led code reviews, troubleshooting, and internal knowledge sharing.',
        ],
      },
      {
        period: 'Mar 2024 – May 2025',
        role: 'Full-Stack Engineer',
        company: 'Frost & Sullivan (Beijing) Consulting Co., Ltd. — Shanghai Branch',
        location: 'Shanghai',
        highlights: [
          'Participated in product requirements analysis and architecture design, translating complex business needs into scalable technical solutions and shipping multiple projects from concept to production within 3 months.',
          'Led frontend technology selection and framework setup, improving page load speed by 35% and achieving 98% design fidelity.',
          'Collaborated with backend teams on system modeling and high-availability API development, reducing system failure rate by 45% and maintaining 99.9%+ service stability.',
          'Core contributor to a Slate.js-based rich-text editor, improving editing performance by 20% and strengthening product competitiveness.',
        ],
      },
      {
        period: 'Jul 2023 – Jan 2024',
        role: 'Software Development Engineer',
        company: 'Shanghai Huaixin Intelligent Technology Co., Ltd.',
        location: 'Shanghai',
        highlights: [
          'Developed Web-based frontend pages for the MES system.',
          'Performed secondary development on Siemens OpCenter EXPR based on business requirements.',
          'Owned module-level development, debugging, and maintenance.',
        ],
      },
      {
        period: 'Dec 2022 – May 2023',
        role: 'Frontend Engineer',
        company: 'Shanghai Lingyun Information Technology Co., Ltd.',
        location: 'Shanghai',
        highlights: [
          'Built ToB admin systems using Vue 3, TypeScript, Element Plus, and ECharts for complex data visualization and permission configuration.',
          'Implemented features from prototypes and resolved complex permission configuration challenges.',
        ],
      },
    ],
    skills: [
      {
        title: 'Frontend Architecture',
        items: [
          'JavaScript / TypeScript: ES6+, async/event loop, modularity, engineering practices; deep understanding of scope, closures, prototypes, design patterns, and maintainable code.',
          'React ecosystem: Hooks, Context, component abstraction, state management (Zustand, etc.), routing, forms, permissions, micro-frontends; performance optimization (memo, useMemo, useCallback, profiling, code splitting, lazy loading).',
          'Vue ecosystem: Vue 3 Composition API, Pinia, Vue Router; component library design and complex module decomposition; reactivity and rendering internals.',
          'Build & optimization: Vite/Webpack, Babel, PostCSS; multi-environment CI pipelines; first paint, caching, on-demand loading, bundle analysis, CDN, error monitoring, and analytics.',
        ],
      },
      {
        title: 'Full-Stack & Cross-Platform',
        items: [
          'Node.js full-stack: TypeScript server-side engineering with NestJS/Hono — API design, validation, auth, permissions, error handling, and logging.',
          'Full-stack frameworks: Next.js, TanStack Start, Nuxt — CSR/SSR/SSG/ISR, data fetching/caching, Server Actions, and middleware.',
          'Databases: PostgreSQL schema/index design, query optimization, transactions; Drizzle ORM type-safe modeling, migrations, and data access layers.',
          'Cross-platform: React Native & Expo engineering and release; familiarity with Taro mini-programs and Tauri desktop apps.',
        ],
      },
      {
        title: 'AI',
        items: [
          'AI Agent coding: proficient with Cursor, Codex, Claude Code — task decomposition, multi-turn implementation, prompt/rules/context management, and reusable skills for scaffolding, components, APIs, logging, and performance analysis.',
          'Agent development: end-to-end intelligent agent apps with Mastra, Vercel AI SDK, LangChain — model integration, tool/function calling, RAG, structured output, streaming, evaluation, and observability.',
          'Python: self-taught; data processing and automation scripting.',
          'AI workflows: hands-on with Dify, n8n, Inngest for data ingestion, triggers, orchestration, persistence, and notifications.',
        ],
      },
    ],
    education: [
      {
        period: 'Sep 2014 – Jun 2018',
        degree: 'Bachelor of Engineering',
        school: 'Shanghai University of Electric Power',
        major: 'Electronic Information Engineering',
      },
    ],
    projects: [
      {
        period: 'Oct 2025 – Mar 2026',
        name: 'Helix AI Research Workstation',
        url: 'https://workstation.newidea.pro',
        intro: 'AI-powered research and writing workstation: create and manage AI writing tasks, view real-time execution logs and dashboards, edit/review/export in a rich-text environment; supports SaaS and on-premise multi-site deployments.',
        tech: 'Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Zustand/Immer, umi-request, SSE, Plate (Slate) editor, Chart.js, Zod/TanStack Form, pnpm, biome/Husky.',
        highlights: [
          'Built core business pages: task list/pagination, task detail step flows, dashboards, and token usage with optimized data fetching, state sync, and interaction (visibility-based refresh, debouncing).',
          'Designed unified API layer: umi-request prefix, Bearer auth, 401/token refresh via @helix/helix-token-manager, business error routing, and i18n error messages.',
          'Implemented streaming AI output and task logs via SSE, with Streamdown + Markdown for incremental rendering and Safari compatibility.',
          'Complex multi-type task forms with field dependencies, validation hooks, and conditional rendering.',
          'Plate plugin system for Diff, Mermaid, tables, and serialization — supporting long-document editing, comparison, and export.',
        ],
      },
      {
        period: 'May 2025 – Present',
        name: 'NewIdea AI Medical Research Workbench',
        url: 'https://newidea.pro',
        intro: 'Vertical AI collaboration platform for medical and research workflows. Integrates Dify orchestration and CopilotKit tool-calling to expose page capabilities to AI assistants — covering literature analysis, academic writing, and grant proposal assistance.',
        tech: 'Next.js, React, Tailwind CSS, Dify, Docker, CopilotKit',
        highlights: [
          'Maintained and extended writing workbench pages, reusing one codebase across a dozen deployed writing scenarios.',
          'Architected "AI Agent + immersive workbench" integration, shortening core writing cycles from weeks to hours.',
          'Customized Platejs research editor with AI text selection, revision mode, and smart reminders; solved atomic incremental rendering for conflict-free AI/human content merging, improving grant proposal output efficiency by 70%.',
        ],
      },
      {
        period: 'May 2024 – Dec 2024',
        name: 'Knowlengine Editor',
        url: 'https://www.knowlengine.com',
        intro: 'Enterprise intelligent writing editor built on React and SlateJS. Monorepo architecture with pnpm workspaces for modular, extensible document editing.',
        tech: 'React, TypeScript, SlateJS, Vite, pnpm',
        highlights: [
          'Extended SlateJS with configurable core editor and plugin architecture; optimized large-document editing performance.',
          'Built collaborative editing with Slate.js + Yjs and Hocuspocus for real-time sync and persistence.',
          'Developed term data processing, multi-format export (Word, plain text), and ECharts chart generation.',
          'TypeScript type-safe development with comprehensive unit tests and modular code organization.',
        ],
      },
    ],
    languages: [
      'Mandarin: Native',
      'English: Proficient',
    ],
  },
}
