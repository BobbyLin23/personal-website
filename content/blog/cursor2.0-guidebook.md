---
title: Cursor 2.0 Guidebook
description: Some tips for Cursor 2.x in 2026.
date: '2026-1-22'
tags:
  - AI Coding
  - Tech
  - AI
---

2026年，随着Coding Agent进一步的发展，Cursor针对Agents新出的各种feature和能力都有了进一步的提升。
虽然目前最火的Coding Agent都是CLI工具，但是对于非纯Vibe Coding场景下，程序员还是需要一个IDE环境去管理和维护代码，所以目前Cursor依旧是市面上最好的选择。
本文主要从以下几个部分展开：
1. Cursor 在2026当下的2.x版本如何使用
2. 如何使用Cursor提高工作效率

---
# Cursor Features

## 管理上下文

### Rules

Cursor的rules是最早出现的约束Agent行为的context形式，现在支持的rules格式有：
- Project Rules
- User Rules
- AGENTS.md

对于rules规则，需要有好的聚焦性、可执行性以及约束范围。
一般情况下，使用rules是为了直接约束一下agent的代码规范，执行命令的约束，指定它使用的包管理器以及包的版本等信息，可以在agent给出不恰当的指令后维护到rules中。推荐使用AGENTS.md，方便迁移到其他的agent上。

同时现在也支持从Github上直接添加rules

### Skills
Skills是Anthropic推出的新一代标准，用于规划和指导Agent
Agent Skills是包含指令、脚本和资源的文件夹，Agent可以发现并使用它们来更准确、更高效地完成任务。
在cursor中目前想要使用，需要更新到nightly beta 版本。

| Location | Scope |
| --- | --- |
| .cursor/skills | Project-level |
|~/.cursor/skills/ | User-level (global)|

```
.cursor/
└── skills/
    └── deploy-app/
        ├── SKILL.md
        ├── scripts/
        │   ├── deploy.sh
        │   └── validate.py
        ├── references/
        │   └── REFERENCE.md
        └── assets/
            └── config-template.json
```

推荐使用的skills
- Superpowers
- Vercal Lab
  - React Best Practice
  - Web Design Guideline

### Commands

Commands支持将使用频率高的操作以md的格式定义后，在对话框中使用/ 去使用。
目前没遇到过很实用的场景
```
.cursor/
└── commands/
    ├── address-github-pr-comments.md
    ├── code-review-checklist.md
    ├── create-pr.md
    ├── light-review-existing-diffs.md
    ├── onboard-new-developer.md
    ├── run-all-tests-and-fix.md
    ├── security-audit.md
    └── setup-new-feature.md
```
### Subagents

子代理是 Cursor 的Agent可以委派任务的专业化 AI 助手。每个Subagent在自己的上下文窗口中运行,处理特定类型的工作,并将结果返回给父Agent。

⚠️ 注意:Subagent功能仅在 nightly beta中可用。
- 上下文隔离 - 每个子代理有独立的上下文窗口,长时间研究任务不会占用主对话空间
- 并行执行 - 可同时启动多个子代理,在代码库不同部分工作
- 专业化能力 - 可为特定领域任务配置自定义提示词、工具访问权限和模型
- 可重用性 - 定义的自定义子代理可跨项目使用

运行模式

自定义子代理配置
- 项目级: .cursor/agents/ (仅当前项目)
- 用户级: ~/.cursor/agents/ (该用户的所有项目)
文件格式
使用带 YAML 前置元数据的 Markdown 文件:
```
---
name: security-auditor
description: 安全专家。用于实现认证、支付或处理敏感数据时
model: inherit
---
你是一个安全专家...
```

**最佳实践**

✅ 推荐做法:
- 每个subagent专注于单一明确的职责
- 精心编写 description 字段以触发正确的委派
- 将 .cursor/agents/ 加入版本控制供团队使用
❌ 避免以下：
- 创建几十个泛用Subagent
- 描述过于模糊（"用于一般任务"）
- 提示词过长
- 简单任务应使用斜杠命令而非子代理

### @ mention

在对话框中支持 @ 添加：
- 文件
- 文件夹
- web
- 之前的聊天（当之前的聊天上下文窗口满了后，可以使用这种方式减少上下文）

### MCP
推荐使用
- context7 查文档
- figma 简单UI目前还原不错，但是复杂的情况下不推荐

## 使用Agent

### Agent

### Plan

### Debug

### Hooks

# 在工作中使用Cursor

1. 将Cursor相关的rules加到git仓库中定期更新与维护，针对每个项目配置不同的规则和context
2. 不要让Agent去创建项目，安装包，不仅容易弄错，还会浪费token
3. 管理网络
    1. 使用Tun Mode + HTTP2 是使用国外模型最快速的方式，但是会有ip质量的要求
    2. 使用HTTP1.1 + VPN的系统代理
    3. 使用Proxifer代理Cursor的网络，参考教程，缺点是软件需要付费
    4. [教程](https://help.huacloud.dev/%e7%9f%a5%e8%af%86%e6%b8%85%e5%8d%95/cursor-ide-%e4%bb%a3%e7%90%86%e9%85%8d%e7%bd%ae%e5%ae%8c%e6%95%b4%e6%8c%87%e5%8d%97)
