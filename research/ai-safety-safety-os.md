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
````

---

## Core Architecture

Safety OS is organized around six primary layers.

### 1. Safety Perception

Inputs include:

* safety sensor
* 3D camera
* AGV state
* Robot state
* PLC signals
* safety doors
* emergency stops
* industrial sensors

The perception layer produces a unified representation of the physical
environment.

---

### 2. Spatial Intelligence

The spatial layer maintains:

* coordinate systems;
* workstation models;
* personnel locations;
* AGV trajectories;
* robot workspaces;
* hazardous areas;
* virtual fences;
* safety distances.

This transforms isolated sensor measurements into an explicit
representation of industrial space.

---

### 3. AI Risk Engine

The AI Risk Engine estimates operational risk using information such as:

* object location;
* relative distance;
* velocity;
* trajectory;
* time-to-collision;
* machine state;
* safety-zone state;
* sensor confidence;
* historical events.

AI is used as an enhancement mechanism rather than as the sole
functional-safety mechanism.

---

<a id="safety-supervisor"></a>

## Safety Supervisor

The Safety Supervisor provides deterministic orchestration between AI
risk estimation and physical control.

Typical states include:

```text
Normal
   ↓
Warning
   ↓
Slowdown
   ↓
Pause
   ↓
E-Stop Request
```

The complete runtime also includes:

```text
Degraded
Recovery Check
Fault
```

The core design rules include:

1. safer actions have higher priority;
2. loss of critical information triggers degradation;
3. communication timeout must be explicitly handled;
4. failed commands must produce deterministic fallback behavior;
5. recovery requires verification rather than automatic reset.

---

## Safety Quality Frame

A safety-oriented spatial sensor should provide more than depth data.

A Safety Quality Frame may include:

```text
Depth
Depth Confidence
Data Validity
Occlusion Ratio
Multipath Interference
Ambient-Light Interference
Time Synchronization Status
Calibration Status
Data Integrity
Safety Quality Level
Recommended Degraded Action
```

The key idea is:

> The sensing system should report not only what it sees, but whether
> the current information is reliable enough to support a safety decision.

---

# Functional Safety + AI

Safety OS follows a layered safety strategy:

```text
L0  Inherent Safety
        ↓
L1  Functional Safety
        ↓
L2  Process / Machine Control
        ↓
L3  AI-enhanced Safety
        ↓
L4  Governance & Evidence
```

AI should enhance — not silently replace — the deterministic safety
mechanisms required by the system risk assessment.

Relevant engineering frameworks include:

* IEC 61508
* ISO 13849
* IEC 62061
* IEC 62443
* ISO/IEC 42001

---

<a id="safety-case"></a>

# Safety Case & V&V

A core Safety OS lifecycle is:

```text
Hazard
   ↓
Safety Goal
   ↓
Safety Requirement
   ↓
Design Control
   ↓
Test Case
   ↓
Evidence
   ↓
Residual Risk
```

Important engineering artifacts include:

* Hazard Log
* HARA / HAZOP
* FMEA
* Safety Requirements Specification
* Interface Control Document
* Requirements Traceability Matrix
* V&V Test Cases
* Fault Injection Results
* Evidence Manifest
* Residual Risk Acceptance

---

# Example Industrial Applications

Current application directions include:

### Battery Pack Production Lines

* AGV / personnel mixed traffic
* robot working areas
* high-voltage testing
* heavy-load handling
* blind-zone detection
* spatial safety control

### Industrial Machinery

Safety OS concepts can also be applied to:

* cold press equipment;
* coating;
* calendering;
* slitting;
* winding;
* assembly;
* EOL testing;
* robotic manufacturing cells.

---

# Research Roadmap

```text
Industrial Safety
        │
        ▼
Spatial Safety
        │
        ▼
AI Safety
        │
        ▼
Safety OS
        │
        ▼
Safety Agents
        │
        ▼
Safety Foundation Models
        │
        ▼
Autonomous Safety Engineering
```

The long-term goal is a safety intelligence infrastructure capable of
supporting risk discovery, system design, verification, evidence
generation and runtime safety operation across industrial systems.

---

## Related Research

* Industrial AI
* Vision Operating System
* Industrial Spatial Safety
* 3D + AI
* Industrial AI Agents
* Embodied / Physical AI
* Intelligent Manufacturing

