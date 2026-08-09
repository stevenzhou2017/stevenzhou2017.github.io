---
layout: page
title: "AI Safety & Industrial Safety OS"
description: "Research on AI-enhanced industrial safety, Safety OS, spatial intelligence, Safety Supervisor, functional safety, V&V and Safety Case engineering."
permalink: /research/ai-safety-safety-os/
category: research
graph_type: research
---

# AI Safety & Industrial Safety OS

## Overview

Artificial intelligence is increasingly moving from advisory analytics
into systems that perceive the physical world, estimate risk, recommend
actions and interact with industrial equipment.

This creates a fundamental engineering question:

> How can AI improve industrial safety without becoming an uncontrolled
> source of safety risk itself?

My research in **AI Safety and Industrial Safety OS** focuses on
system-level architectures that combine conventional functional safety
principles with AI perception, spatial intelligence, uncertainty
estimation, risk reasoning, deterministic supervision and
evidence-driven lifecycle engineering.

---

## Research Philosophy

The central principle is:

> **A safety-oriented AI system must know when its information is
> insufficient to support a safe decision.**

AI should therefore not only output:

- what was detected;
- where an object is;
- what may happen next.

It should also provide information about:

- confidence;
- data validity;
- synchronization status;
- calibration validity;
- occlusion;
- sensor degradation;
- uncertainty;
- recommended degraded behavior.

When confidence is insufficient, the system should transition toward a
safer operating state rather than continue making increasingly uncertain
decisions.

---

# Industrial Safety OS

## Safety OS

Safety OS is an industrial spatial safety architecture for
people, vehicles, robots, machines and materials.

Its architecture can be represented as:

```text
Physical World
      │
      ▼
3D / Sensor / AGV / Robot / PLC
      │
      ▼
Device Adapter Layer
      │
      ▼
Unified Industrial Data Model
      │
      ▼
Spatial Modeling
      │
      ▼
AI Perception & Fusion
      │
      ▼
AI Risk Engine
      │
      ▼
Safety Supervisor
      │
      ▼
Command / PLC / Robot / AGV
      │
      ▼
Safe Action
      │
      ▼
Event Trace / Recorder / Safety Case
