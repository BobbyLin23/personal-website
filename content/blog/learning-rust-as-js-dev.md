---
title: Learning Rust as a JavaScript Developer
description: My journey learning Rust coming from a JavaScript background, with tips for fellow JS developers making the transition.
date: '2023-11-10'
tags:
  - Rust
  - JavaScript
  - Learning
---

As a JavaScript developer, learning Rust was both challenging and rewarding. Here's what I discovered along the way.

## Why Rust?

- **WebAssembly**: Rust compiles to WASM for near-native performance in the browser
- **Tooling**: Many JS tools are being rewritten in Rust (SWC, Turbopack, Rolldown)
- **Systems programming**: Understanding lower-level concepts
- **Safety**: No null pointer exceptions, no data races

## Key Differences from JavaScript

### Ownership & Borrowing

The biggest mindset shift:

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // s1 is MOVED, no longer valid

    // println!("{}", s1); // ERROR: value used after move
    println!("{}", s2);    // OK
}
```

### No Garbage Collector

Rust manages memory at compile time through its ownership system. No runtime GC means predictable performance.

### Pattern Matching

One of Rust's most elegant features:

```rust
match status_code {
    200 => println!("OK"),
    404 => println!("Not Found"),
    500..=599 => println!("Server Error"),
    _ => println!("Unknown"),
}
```

## Tips for JS Developers

1. **Start with the Rust Book** — it's excellent
2. **Embrace the compiler** — it's your friend, not enemy
3. **Don't fight the borrow checker** — learn to work with it
4. **Build something real** — a CLI tool is a great first project

## Conclusion

Rust made me a better programmer overall. The concepts I learned have improved even my JavaScript code. Give it a try!
