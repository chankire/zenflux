# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: "[plugin:vite:react-swc]"
    - generic [ref=e6]: "x Expression expected ,-[C:/Users/chank/claude-code-projects/zenflux/src/pages/EnterpriseDashboard.tsx:188:1] 185 | Chart will be rendered here with Recharts 186 | </div> 187 | */ 188 | </CardContent> : ^ 189 | </Card> 190 | 191 | <Card className=\"chart-container\"> `---- x Unterminated regexp literal ,-[C:/Users/chank/claude-code-projects/zenflux/src/pages/EnterpriseDashboard.tsx:188:1] 185 | Chart will be rendered here with Recharts 186 | </div> 187 | */ 188 | </CardContent> : ^^^^^^^^^^^^^ 189 | </Card> 190 | 191 | <Card className=\"chart-container\"> `---- Caused by: Syntax Error"
  - generic [ref=e7]: C:/Users/chank/claude-code-projects/zenflux/src/pages/EnterpriseDashboard.tsx
  - generic [ref=e9]:
    - text: Click outside, press
    - generic [ref=e10]: Esc
    - text: key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e11]: server.hmr.overlay
    - text: to
    - code [ref=e12]: "false"
    - text: in
    - code [ref=e13]: vite.config.ts
    - text: .
```